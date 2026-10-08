"""Repair selected narration through resumable Gemini TTS batches.

submit --key-file PATH --keys .tools/voice-repair-keys.json
collect --key-file PATH
validate --keys .tools/voice-repair-keys.json (offline, no credentials)

Default revision 1 queues each key once. Use an explicit higher --revision only
after a subsequent audit confirms that an already repaired clip needs repair.
Paid results are retained locally before publication; local filesystem failures
must be recovered with collect, never by submitting another paid request.
"""
import argparse
import base64
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import time
import urllib.error
import urllib.parse
import urllib.request
import wave

ROOT = Path(__file__).resolve().parent.parent
MODEL = 'gemini-3.8-flash-lite-tts'
OUT = ROOT / 'assets/voice/announcements-lite'
JOBS = ROOT / '.tools/voice-repair-jobs.json'
RESULTS = ROOT / '.tools/voice-repair-results'
ORIGINALS = ROOT / '.tools/voice-repairs-original'

spec = importlib.util.spec_from_file_location('voice_batch', ROOT / 'scripts/generate-voice-batch.py')
batch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(batch)
generation = batch.generation
STYLE = generation.STYLE + ' Read transcript exactly ONCE. Never restart or repeat any phrase.'


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    generation.replace_file(temporary, path)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None


def load_keys(path):
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    entries = data.get('keys', []) if isinstance(data, dict) else data
    if not isinstance(entries, list):
        raise ValueError('Repair keys must be a JSON list or an object containing a keys list.')
    keys = []
    for entry in entries:
        key = entry.get('clip_key') if isinstance(entry, dict) else entry
        if not isinstance(key, str) or not re.fullmatch(r'[a-f0-9]{16}', key):
            raise ValueError('Invalid repair clip key; expected a lowercase sha16.')
        if key not in keys:
            keys.append(key)
    return keys


def load_overrides(path, keys):
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    overrides = data.get('overrides', {}) if isinstance(data, dict) else {}
    if not isinstance(overrides, dict):
        raise ValueError('Phonetic overrides must map clip keys to spoken strings.')
    for key, spoken in overrides.items():
        if key not in keys or not isinstance(spoken, str) or not spoken.strip():
            raise ValueError('Every phonetic override must have a selected clip key and nonempty spoken text.')
    return overrides


def payload(line):
    value = batch.payload(line)
    value['contents'][0]['parts'][0]['speech_metadata']['style'] = STYLE
    return value


def paths(key):
    return {suffix: OUT / (key + '.' + suffix) for suffix in ['wav', 'mp3']}


def preserve_original(key):
    # Content-addressed backups never overwrite an earlier revision's original.
    for suffix, source in paths(key).items():
        source_hash = digest(source)
        if source_hash is None:
            continue
        target = ORIGINALS / key / (source_hash + '.' + suffix)
        if target.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(target.suffix + '.tmp')
        for attempt in range(12):
            try:
                shutil.copyfile(source, temporary)
                generation.replace_file(temporary, target)
                break
            except PermissionError:
                if attempt == 11:
                    raise
                time.sleep(.25 * (attempt + 1))


def publish_audio(key, response):
    audio = next(part['inlineData'] for part in response['candidates'][0]['content']['parts']
                 if 'inlineData' in part)
    raw = base64.b64decode(audio['data'], validate=True)
    target = paths(key)['wav']
    temporary = target.with_suffix('.repair.wav.tmp')
    if raw[:4] == b'RIFF':
        temporary.write_bytes(raw)
    else:
        with wave.open(str(temporary), 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(24000)
            wav.writeframes(raw)
    if not generation.valid_audio(temporary):
        raise ValueError('Generated repair audio is invalid or silent.')
    for attempt in range(12):
        try:
            generation.trim_silence(temporary)
            break
        except PermissionError:
            if attempt == 11:
                raise
            time.sleep(.25 * (attempt + 1))
    output_hash = digest(temporary)
    if digest(target) != output_hash:
        preserve_original(key)
        generation.replace_file(temporary, target)
    else:
        temporary.unlink(missing_ok=True)
    return output_hash


def published(key, record):
    return bool(record.get('published_hash')) and digest(paths(key)['wav']) == record['published_hash']


def eligible(keys, jobs, revision):
    blocked = set()
    for job in jobs['jobs']:
        if job.get('revision', 1) != revision:
            continue
        for key in job['keys']:
            reason = job.get('failure_reasons', {}).get(key, '')
            if job['state'] in ['failed', 'cancelled', 'expired'] or reason.startswith('API error '):
                continue
            blocked.add(key)
    return [key for key in keys if key not in blocked]


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('command', choices=['submit', 'collect', 'validate'])
    parser.add_argument('--key-file', type=Path)
    parser.add_argument('--keys', type=Path, default=ROOT / '.tools/voice-repair-keys.json')
    parser.add_argument('--revision', type=int, default=1)
    args = parser.parse_args()
    if args.revision < 1:
        parser.error('--revision must be positive.')
    lines = json.loads((ROOT / 'assets/voice/lines.json').read_text(encoding='utf-8'))['lines']
    by_key = {line['file'][:-4]: line for line in lines}
    jobs = json.loads(JOBS.read_text(encoding='utf-8')) if JOBS.exists() else {'model': MODEL, 'voice': 'Kore', 'style': STYLE, 'jobs': []}
    if jobs.get('model') != MODEL:
        raise SystemExit('Existing repair job model differs; preserve the record first.')
    if args.command in ['submit', 'validate']:
        keys = load_keys(args.keys)
        unknown = set(keys) - set(by_key)
        if unknown:
            raise SystemExit('Unknown repair clip keys: ' + ', '.join(sorted(unknown)))
        overrides = load_overrides(args.keys, keys)
        for clip, spoken in overrides.items():
            by_key[clip] = {**by_key[clip], 'spoken': spoken}
        for key in keys:
            assert batch.filename(by_key[key]) == key + '.wav', 'Clip key does not match phrase text.'
        pending = eligible(keys, jobs, args.revision)
        if args.command == 'validate':
            print('Offline schema valid:', len(keys), 'selected;', len(overrides), 'phonetic overrides;', len(pending), 'eligible in revision', args.revision)
            return
    secret = args.key_file.read_text(encoding='utf-8-sig').strip() if args.key_file else os.getenv('GEMINI_API_KEY', '')
    match = re.search(r'AIza[\w-]+', secret)
    key = match.group(0) if match else secret
    if not key:
        raise SystemExit('Set GEMINI_API_KEY or --key-file.')

    def call(path, body=None):
        url = path if path.startswith('https://') else 'https://generativelanguage.googleapis.com/v1beta/' + path
        location = urllib.parse.urlparse(url)
        if location.scheme != 'https' or location.hostname != 'generativelanguage.googleapis.com' or location.username or location.password:
            raise SystemExit('Refusing to send credentials outside the Gemini API origin.')
        request = urllib.request.Request(url, None if body is None else json.dumps(body).encode(),
                                         headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            try:
                message = json.load(error).get('error', {}).get('message', '')
            except Exception:
                message = ''
            message = re.sub(r'AIza[\w-]+', '[redacted]', message.replace(key, '[redacted]'))
            raise SystemExit(f'HTTP {error.code}: {message[:700]}') from None

    OUT.mkdir(parents=True, exist_ok=True)
    if args.command == 'submit':
        for start in range(0, len(pending), 200):
            chunk = pending[start:start + 200]
            records = {clip: {'source_hash': {suffix: digest(path) for suffix, path in paths(clip).items()},
                              'spoken': by_key[clip]['spoken'],
                              'spoken_hash': hashlib.sha256(by_key[clip]['spoken'].encode()).hexdigest()}
                       for clip in chunk}
            requests = [{'request': payload(by_key[clip]), 'metadata': {'key': clip}} for clip in chunk]
            # Persist intent first. If the process loses the response or cannot
            # save the returned name, another submit must not pay twice.
            job = {'name': None, 'revision': args.revision, 'keys': chunk,
                   'clips': records, 'state': 'submitting'}
            jobs['jobs'].append(job)
            save_json(JOBS, jobs)
            try:
                response = call('models/' + MODEL + ':batchGenerateContent',
                                {'batch': {'display_name': f'train-hiragana-repair-r{args.revision}-{start}',
                                           'input_config': {'requests': {'requests': requests}}}})
            except SystemExit:
                job['state'] = 'failed'
                save_json(JOBS, jobs)
                raise
            name = response.get('name') or response.get('batch', {}).get('name')
            if not name:
                raise SystemExit('Batch response had no job name; preserve the response before retrying.')
            job.update(name=name, state='submitted')
            print('Submitted', len(chunk), 'repair clips:', name, flush=True)
            save_json(JOBS, jobs)
        print('Repair jobs:', len(jobs['jobs']))
        return

    latest = {clip: index for index, job in enumerate(jobs['jobs']) for clip in job['keys']}
    for index, job in enumerate(jobs['jobs']):
        active_keys = [clip for clip in job['keys'] if latest[clip] == index]
        if not active_keys:
            continue
        if not job.get('name'):
            print('Unresolved submission intent; recover its API job name before retrying:', ', '.join(active_keys), flush=True)
            continue
        if job['state'] == 'collected' and all(published(clip, job['clips'][clip]) for clip in active_keys):
            continue
        if job['state'] in ['failed', 'cancelled', 'expired']:
            continue
        cache = RESULTS / (hashlib.sha256(job['name'].encode()).hexdigest()[:24] + '.json')
        result = json.loads(cache.read_text(encoding='utf-8')) if cache.exists() else call(job['name'])
        state = result.get('metadata', {}).get('state') or result.get('state') or 'unknown'
        job['api_state'] = state
        terminal = state.rsplit('_', 1)[-1]
        print(job['name'], state, flush=True)
        if terminal in ['FAILED', 'CANCELLED', 'EXPIRED'] or (result.get('done') and result.get('error')):
            job['state'] = terminal.lower() if terminal in ['FAILED', 'CANCELLED', 'EXPIRED'] else 'failed'
            save_json(JOBS, jobs)
            continue
        inline = batch.inline_results(result)
        complete = terminal == 'SUCCEEDED' or result.get('done', False)
        if inline is None:
            save_json(JOBS, jobs)
            continue
        # Cache final paid payload before any potentially failing WAV write.
        # Nonterminal partial lists are fetched again so later outputs aren't lost.
        if complete and not cache.exists():
            save_json(cache, result)
        errors = dict(job.get('failure_reasons', {}))
        for index, item in enumerate(inline):
            clip = item.get('metadata', {}).get('key') or item.get('key')
            if not clip and len(inline) == len(job['keys']):
                clip = job['keys'][index]
            if clip not in active_keys:
                continue
            if published(clip, job['clips'][clip]):
                errors.pop(clip, None)
                continue
            if 'response' not in item or item.get('error') or item.get('response', {}).get('error'):
                errors[clip] = 'API error ' + str((item.get('error') or item.get('response', {}).get('error') or {}).get('code', 'unknown'))
                continue
            try:
                job['clips'][clip]['published_hash'] = publish_audio(clip, item['response'])
                errors.pop(clip, None)
            except (ValueError, KeyError, StopIteration, OSError, EOFError, wave.Error) as error:
                errors[clip] = type(error).__name__
        missing = [clip for clip in active_keys if not published(clip, job['clips'][clip])]
        job['state'] = 'collected' if not missing else 'partial' if complete else 'running'
        job['failed_keys'] = missing
        job['failure_reasons'] = errors
        save_json(JOBS, jobs)
        print('Published repairs', len(job['keys']) - len(missing), '/', len(job['keys']), flush=True)


if __name__ == '__main__':
    main()
