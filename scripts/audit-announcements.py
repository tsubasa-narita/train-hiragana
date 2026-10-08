"""Audit published Japanese narration with Gemini 3.8 Flash audio batches.

python scripts/audit-announcements.py submit --key-file PATH
python scripts/audit-announcements.py collect --key-file PATH
python scripts/audit-announcements.py retry-failed --key-file PATH
Use submit --dry-run to validate and size every request without API calls.
Official specifications: ai.google.dev/gemini-api/docs/audio and /batch-api.
TTS generation remains a separate Flash-Lite job; this script only transcribes.
"""
import argparse
import base64
import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL = 'gemini-3.8-flash'
VERSION = 1
JOBS = ROOT / '.tools/voice-asr-jobs.json'
REPORT = ROOT / '.tools/voice-content-audit.json'
MAX_REQUESTS = 200
MAX_BYTES = 17_000_000
SCHEMA = {'type': 'OBJECT', 'properties': {
    'transcript': {'type': 'STRING'}, 'repeats': {'type': 'BOOLEAN'},
    'matches': {'type': 'BOOLEAN'}, 'reason': {'type': 'STRING'}},
    'required': ['transcript', 'repeats', 'matches', 'reason']}
PROMPT = '''You are auditing a Japanese railway announcement audio recording.
Listen to the ENTIRE supplied audio, including its ending. First transcribe every
spoken word in order, including false starts, restarted clauses and repetitions.
Do not correct pronunciation, fill missing words, deduplicate or replace what you
heard with the expected text. The expected text below is COMPARISON ONLY.
Return the complete verbatim transcript, then compare the actual audio with the
expected pronunciation. Ignore writing-only differences (kanji versus kana,
Arabic versus Japanese numerals, whitespace and punctuation). Do not ignore a
different spoken syllable, dropped phrase, extra words or changed meaning.
repeats=true ONLY when an extra repetition/restart exceeds the expected text.
Naturally repeated sounds already required by the expected text are not defects:
for example こまちの「こ」 should contain both instances of こ, without repeats.
An expected sentence spoken twice, or a second partial restart, is repeats=true
and matches=false. Missing or extra speech, mispronounced words, and incorrect
meaning are matches=false. Non-speech/silence is not a correct transcript.
Give a brief Japanese reason; do not report a spelling-only difference as a defect.
Expected text for comparison only: '''


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8')


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for attempt in range(12):
        try:
            os.replace(temporary, path)
            return
        except PermissionError:
            if attempt == 11:
                raise
            time.sleep(.25 * (attempt + 1))


def load_json(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def clips():
    source = (ROOT / 'src/announcement-manifest.js').read_text(encoding='utf-8')
    # The generated module exports one JSON object. Do not evaluate JavaScript.
    manifest = json.loads(source.split('export const ANNOUNCEMENT_FILES =', 1)[1].strip().rstrip(';'))
    lines = json.loads((ROOT / 'assets/voice/lines.json').read_text(encoding='utf-8'))['lines']
    by_text = {line['text']: line for line in lines}
    for text, filename in manifest.items():
        if text not in by_text:
            raise ValueError('Published narration has no source line.')
        line = by_text[text]
        target = (ROOT / 'assets/voice' / filename).resolve()
        if not target.is_relative_to((ROOT / 'assets/voice').resolve()) or target.suffix != '.mp3':
            raise ValueError('Invalid published narration path.')
        raw = target.read_bytes()
        if len(raw) <= 256:
            raise ValueError('Missing or empty narration clip: ' + line['file'])
        audio_hash = hashlib.sha256(raw).hexdigest()
        fingerprint = hashlib.sha256(encoded([VERSION, MODEL, audio_hash, line['spoken']])).hexdigest()
        clip_key = line['file'].rsplit('.', 1)[0]
        yield {'key': clip_key + '-' + fingerprint[:24], 'clip_key': clip_key,
               'audio_sha256': audio_hash, 'fingerprint': fingerprint,
               'text': text, 'expected': line['spoken'], 'file': filename, 'raw': raw}


def payload(clip, max_output_tokens=1024):
    return {'contents': [{'role': 'user', 'parts': [
        {'text': PROMPT + json.dumps(clip['expected'], ensure_ascii=False)},
        {'inlineData': {'mimeType': 'audio/mp3', 'data': base64.b64encode(clip['raw']).decode('ascii')}}]}],
        'generationConfig': {'thinkingConfig': {'thinkingLevel': 'low'}, 'maxOutputTokens': max_output_tokens,
                             'responseMimeType': 'application/json', 'responseSchema': SCHEMA}}


def batch_body(requests, display_name='train-hiragana-asr'):
    return {'batch': {'display_name': display_name,
                      'input_config': {'requests': {'requests': requests}}}}


def chunks(pending, max_output_tokens=1024):
    current = []
    # Account for delimiters once; avoid repeatedly serializing all audio in a
    # growing chunk. Reserve a longer display name than the actual job name.
    overhead = len(encoded(batch_body([], 'x' * 120)))
    size = overhead
    for clip in pending:
        request = {'request': payload(clip, max_output_tokens), 'metadata': {'key': clip['key']}}
        request_bytes = len(encoded(request))
        if len(current) >= MAX_REQUESTS or size + request_bytes + bool(current) > MAX_BYTES:
            if not current:
                raise ValueError('An individual ASR request exceeds the payload limit.')
            yield current
            current = []
            size = overhead
        size += request_bytes + bool(current)
        current.append((clip, request))
        if size > MAX_BYTES:
            raise ValueError('An individual ASR request exceeds the payload limit.')
    if current:
        yield current


def inline_results(result):
    for field in ('output', 'response', 'dest'):
        destination = result.get(field) or {}
        inline = destination.get('inlinedResponses')
        if isinstance(inline, dict):
            inline = inline.get('inlinedResponses')
        if isinstance(inline, list):
            return inline
    return None


def parse_transcript(response):
    parts = response['candidates'][0]['content']['parts']
    value = json.loads(''.join(part.get('text', '') for part in parts if not part.get('thought')))
    if not isinstance(value, dict) or any(type(value.get(k)) is not t for k, t in
            [('transcript', str), ('repeats', bool), ('matches', bool), ('reason', str)]):
        raise ValueError('Invalid ASR response schema.')
    value = {key: value[key] for key in SCHEMA['required']}
    # A duplicate or an empty recording can never be a content match.
    if value['repeats'] or not value['transcript'].strip():
        value['matches'] = False
    return value


def api_client(key):
    def call(path, body=None, jsonl=False):
        url = path if path.startswith('https://') else 'https://generativelanguage.googleapis.com/v1beta/' + path
        location = urllib.parse.urlparse(url)
        if location.scheme != 'https' or location.hostname != 'generativelanguage.googleapis.com' or location.username or location.password:
            raise SystemExit('Refusing to send credentials outside the Gemini API origin.')
        request = urllib.request.Request(url, None if body is None else encoded(body),
            headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                if jsonl:
                    return [json.loads(line) for line in response.read().decode('utf-8').splitlines() if line.strip()]
                return json.load(response)
        except urllib.error.HTTPError as error:
            try:
                message = json.load(error).get('error', {}).get('message', '')
            except Exception:
                message = ''
            message = re.sub(r'AIza[\w-]+', '[redacted]', message.replace(key, '[redacted]'))
            raise SystemExit(f'HTTP {error.code}: {message[:700]}') from None
        except (urllib.error.URLError, TimeoutError):
            raise SystemExit('Gemini connection failed; persisted submission may be ambiguous. Do not resubmit it automatically.') from None
    return call


def summary(report, current):
    active = [report['clips'][key] for key in current if key in report['clips']]
    report['summary'] = {'total': len(current), 'audited': len(active),
        'matches': sum(item['matches'] and not item['repeats'] for item in active),
        'mismatches': sum(not item['matches'] for item in active),
        'repeats': sum(item['repeats'] for item in active), 'pending': len(current) - len(active)}
    report['current_keys'] = list(current)


def active_keys(job):
    """Old paid output cannot overwrite a replacement retry's transcript."""
    released = set(job.get('retry_released_keys', []))
    return [key for key in job['keys'] if key not in released]


def reserved_keys(jobs):
    # Even ambiguous POST reservations remain active until explicitly resolved.
    return {key for job in jobs['jobs'] for key in active_keys(job)}


def release_failures(jobs, report, current):
    """Release only confirmed terminal failures; retain all original history."""
    for job in jobs['jobs']:
        terminal = job.get('api_state', '').rsplit('_', 1)[-1]
        if terminal not in ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'] and job.get('state') not in ['failed', 'cancelled', 'expired']:
            continue
        failed = job.get('failed_keys', [])
        keys = [key for key in failed if key in current and key not in report['clips'] and key in active_keys(job)]
        if not keys:
            continue
        reasons = job.get('failure_reasons', {})
        job.setdefault('retry_history', []).append({'keys': keys,
            'failure_reasons': {key: reasons.get(key, 'terminal batch failure') for key in keys},
            'released_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'thinking_level': 'low', 'max_output_tokens': 2048})
        job['retry_released_keys'] = list(dict.fromkeys(job.get('retry_released_keys', []) + keys))
        job['failed_keys'] = [key for key in failed if key not in keys]
        if all(key in report['clips'] for key in active_keys(job)):
            job['state'] = 'collected'
    # Previously released keys are also recoverable after an interruption before
    # replacement submission, unless a new (possibly ambiguous) job reserved them.
    released = {key for job in jobs['jobs'] for key in job.get('retry_released_keys', [])}
    reserved = reserved_keys(jobs)
    return [clip for key, clip in current.items() if key in released and key not in reserved and key not in report['clips']]


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('command', choices=['submit', 'collect', 'retry-failed'])
    parser.add_argument('--key-file', type=Path)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    current = {clip['key']: clip for clip in clips()}
    jobs = load_json(JOBS, {'model': MODEL, 'version': VERSION, 'jobs': []})
    report = load_json(REPORT, {'model': MODEL, 'version': VERSION, 'clips': {}})
    if any(record.get('model') != MODEL or record.get('version') != VERSION for record in (jobs, report)):
        raise SystemExit('Audit schema/model differs; preserve existing records before a new audit.')
    submitted = reserved_keys(jobs)
    pending = [clip for key, clip in current.items() if key not in submitted and key not in report['clips']]
    max_output_tokens = 1024
    if args.command == 'retry-failed':
        pending = release_failures(jobs, report, current)
        max_output_tokens = 2048
    if args.dry_run:
        sizes = [(len(chunk), len(encoded(batch_body([item[1] for item in chunk])))) for chunk in chunks(pending, max_output_tokens)]
        print(json.dumps({'model': MODEL, 'clips': len(current), 'pending': len(pending), 'max_output_tokens': max_output_tokens,
                          'batches': [{'requests': n, 'bytes': size} for n, size in sizes]}))
        return
    secret = args.key_file.read_text(encoding='utf-8-sig').strip() if args.key_file else os.getenv('GEMINI_API_KEY', '')
    match = re.search(r'AIza[\w-]+', secret)
    key = match.group(0) if match else secret
    if not key:
        raise SystemExit('Set GEMINI_API_KEY or --key-file.')
    call = api_client(key)
    if args.command in ['submit', 'retry-failed']:
        if args.command == 'retry-failed':
            save_json(JOBS, jobs)
        for chunk in chunks(pending, max_output_tokens):
            job = {'display_name': 'train-hiragana-asr-' + chunk[0][0]['key'],
                   'keys': [clip['key'] for clip, _ in chunk],
                   'clips': {clip['key']: {k: v for k, v in clip.items() if k != 'raw'} for clip, _ in chunk},
                   'state': 'submitting', 'max_output_tokens': max_output_tokens,
                   'retry': args.command == 'retry-failed'}
            # Reserve before sending, so interrupted/ambiguous POSTs cannot be
            # charged twice by a later submit. Inspect such records explicitly.
            jobs['jobs'].append(job)
            save_json(JOBS, jobs)
            result = call('models/' + MODEL + ':batchGenerateContent',
                          batch_body([request for _, request in chunk], job['display_name']))
            name = result.get('name') or result.get('batch', {}).get('name')
            if not name:
                raise SystemExit('Batch returned no job name; preserved ambiguous submission.')
            job.update(name=name, state='submitted')
            save_json(JOBS, jobs)
            print('Submitted', len(chunk), 'ASR clips:', name, flush=True)
        print('New ASR requests submitted this run:', len(pending), '; recorded jobs:', len(jobs['jobs']))
        return
    for job in jobs['jobs']:
        expected_keys = active_keys(job)
        if job['state'] == 'collected' and all(key in report['clips'] for key in expected_keys):
            continue
        if not job.get('name'):
            print('Preserved ambiguous submission:', job['display_name'], flush=True)
            continue
        result = call(job['name'])
        state = (result.get('metadata') or {}).get('state') or result.get('state') or 'unknown'
        job['api_state'] = state
        terminal = state.rsplit('_', 1)[-1]
        print(job['name'], state, flush=True)
        if terminal in ['FAILED', 'CANCELLED', 'EXPIRED'] or (result.get('done') and result.get('error')):
            job['state'] = terminal.lower() if terminal in ['FAILED', 'CANCELLED', 'EXPIRED'] else 'failed'
            job['failed_keys'] = [key for key in expected_keys if key not in report['clips']]
            job['failure_reasons'] = {key: 'terminal API batch failure' for key in job['failed_keys']}
            save_json(JOBS, jobs)
            continue
        inline = inline_results(result)
        if inline is None:
            for field in ('output', 'response', 'dest'):
                destination = result.get(field) or {}
                file = destination.get('responsesFile') or destination.get('fileName')
                if file:
                    if not re.fullmatch(r'files/[\w.-]+', file):
                        raise SystemExit('Invalid batch output file identifier.')
                    inline = call('https://generativelanguage.googleapis.com/download/v1beta/' + file + ':download?alt=media', jsonl=True)
                    break
        if inline is None:
            save_json(JOBS, jobs)
            continue
        errors = {}
        for index, item in enumerate(inline):
            request_key = (item.get('metadata') or {}).get('key') or item.get('key')
            if not request_key and len(inline) == len(job['keys']):
                request_key = job['keys'][index]
            if request_key not in job['clips'] or request_key not in expected_keys:
                continue
            if request_key in report['clips']:
                continue
            if 'response' not in item:
                errors[request_key] = 'API error ' + str((item.get('error') or {}).get('code', 'unknown'))
                continue
            candidates = item['response'].get('candidates') or []
            finish_reason = candidates[0].get('finishReason') if candidates else None
            if finish_reason and finish_reason != 'STOP':
                errors[request_key] = 'finishReason ' + finish_reason
                continue
            try:
                verdict = parse_transcript(item['response'])
                report['clips'][request_key] = {**job['clips'][request_key], **verdict, 'job': job['name']}
            except (ValueError, KeyError, IndexError, TypeError) as error:
                errors[request_key] = type(error).__name__
        missing = [key for key in expected_keys if key not in report['clips']]
        job.update(state='collected' if not missing else 'partial', failed_keys=missing, failure_reasons=errors)
        summary(report, current)
        save_json(REPORT, report)
        save_json(JOBS, jobs)
    summary(report, current)
    save_json(REPORT, report)
    print(json.dumps(report['summary']))


if __name__ == '__main__':
    main()
