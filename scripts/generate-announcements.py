"""Generate fixed Japanese railway narration offline; never ships an API key.
Usage: python scripts/generate-announcements.py --key-file PATH [--sample] [--all]
Existing valid clips are reused. Default scope: kana, connect names and rewards.
"""
import argparse, base64, hashlib, json, os, re, time, urllib.request, urllib.error, wave, struct
import concurrent.futures, shutil, subprocess, threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STYLE = ('Japanese railway onboard announcement, professional warm female announcer. '
         'Calm, clear, reassuring, measured pace for preschool children. '
         'Read only the supplied Japanese text verbatim. No introductory speech, music or sound effects. '
         'For a single kana, clearly pronounce the complete isolated syllable; do not whisper.')

def selected_lines(lines, sample=False, all_lines=False):
    """Resolve exact runtime names instead of maintaining another train-name list."""
    if sample:
        return [line for line in lines if line['text'] in ['こ', 'こまち']]
    if all_lines:
        return lines
    node = shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
    source = """import { TRAINS } from './src/data.js';
import { CONNECT_MODELS } from './src/connect-assets.js';
import { REWARD_TRAINS } from './src/reward.js';
import { rewardText, VOICE_SAMPLE } from './src/voice-lines.js';
const names = Object.keys(CONNECT_MODELS).map(id => {
 const train = TRAINS.find(t => t.id === id);
 if (!train) throw Error('Missing connect train: ' + id);
 return train.name;
});
console.log(JSON.stringify([...names, ...REWARD_TRAINS.map(rewardText), VOICE_SAMPLE]));"""
    texts = set(json.loads(subprocess.check_output(
        [node, '--input-type=module', '-e', source], cwd=ROOT, encoding='utf-8')))
    available = {line['text'] for line in lines}
    missing = texts - available
    if missing:
        raise SystemExit('Run node scripts/voice-manifest.mjs first; missing lines: ' + ', '.join(sorted(missing)))
    return [line for line in lines if line['text'] in texts or len(line['text']) == 1 or line['text'] == 'のばす おと']

def valid_audio(target):
    try:
        with wave.open(str(target), 'rb') as wav:
            if wav.getsampwidth() != 2 or wav.getnframes() == 0:
                return False
            samples = struct.unpack('<' + 'h' * (wav.getnframes() * wav.getnchannels()), wav.readframes(wav.getnframes()))
        return bool(samples) and max(abs(value) for value in samples) >= 500
    except (OSError, EOFError, wave.Error, struct.error):
        return False

def trim_silence(target):
    """Retain consonant attacks and short breathing room without long TTS pauses."""
    with wave.open(str(target), 'rb') as wav:
        parameters = wav.getparams()
        raw = wav.readframes(wav.getnframes())
    samples = struct.unpack('<' + 'h' * (parameters.nframes * parameters.nchannels), raw)
    # A generous 80 ms margin protects quiet initial consonants, while the
    # 160 ms tail lets a completed syllable settle before another interaction.
    threshold = max(80, max(abs(value) for value in samples) * .003)
    active = [i // parameters.nchannels for i, value in enumerate(samples) if abs(value) > threshold]
    if not active:
        raise ValueError('Silent narration')
    first = max(0, active[0] - round(parameters.framerate * .08))
    last = min(parameters.nframes, active[-1] + round(parameters.framerate * .16) + 1)
    if first == 0 and last == parameters.nframes:
        return
    temporary = target.with_suffix('.trim.tmp')
    with wave.open(str(temporary), 'wb') as wav:
        wav.setparams(parameters)
        bytes_per_frame = parameters.sampwidth * parameters.nchannels
        wav.writeframes(raw[first * bytes_per_frame:last * bytes_per_frame])
    temporary.replace(target)

def replace_file(temporary, target):
    # Windows indexing/OneDrive can briefly hold a reader on a freshly written
    # manifest. Keep the publication atomic and retry the transient lock.
    for attempt in range(12):
        try:
            temporary.replace(target)
            return
        except PermissionError:
            if attempt == 11:
                raise
            time.sleep(.25 * (attempt + 1))

def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--key-file', type=Path)
    parser.add_argument('--sample', action='store_true')
    parser.add_argument('--all', action='store_true')
    parser.add_argument('--model', default='gemini-3.8-flash-lite-tts')
    parser.add_argument('--workers', type=int, choices=[1, 2, 3], default=3)
    parser.add_argument('--requests-per-minute', type=float, default=10,
                        help='Pace requests to the observed quota instead of repeatedly hitting 429.')
    args = parser.parse_args()
    if args.requests_per_minute <= 0:
        parser.error('--requests-per-minute must be positive')
    secret = args.key_file.read_text(encoding='utf-8-sig').strip() if args.key_file else os.getenv('GEMINI_API_KEY', '')
    match = re.search(r'AIza[\w-]+', secret)
    key = match.group(0) if match else secret
    if not key: raise SystemExit('Set GEMINI_API_KEY or --key-file.')
    lines = json.loads((ROOT/'assets/voice/lines.json').read_text(encoding='utf-8'))['lines']
    selected = selected_lines(lines, args.sample, args.all)
    # Keep models separate: switching to Lite must never reuse Flash speech.
    if args.model == 'gemini-3.8-flash-lite-tts':
        folder = 'announcements-lite'
    elif args.model == 'gemini-3.8-flash-tts':
        folder = 'announcements'
    else:
        folder = 'announcements-' + re.sub(r'[^a-zA-Z0-9_-]', '-', args.model)
    out = ROOT/'assets/voice'/folder
    out.mkdir(parents=True, exist_ok=True)
    record = out/'manifest.json'
    manifest = json.loads(record.read_text(encoding='utf-8')) if record.exists() else {'model':args.model,'voice':'Kore','style':STYLE,'files':{}}
    if manifest.get('model') != args.model:
        raise SystemExit('Existing narration model differs; refusing to reuse another model.')
    def save_manifest():
        # Only the main thread publishes the manifest, after validated file writes.
        temporary_record = record.with_suffix('.json.tmp')
        temporary_record.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        replace_file(temporary_record, record)
        script = ROOT/'src/announcement-manifest.js'
        temporary_script = script.with_suffix('.js.tmp')
        temporary_script.write_text('// Generated by scripts/generate-announcements.py\nexport const ANNOUNCEMENT_FILES = '+json.dumps(manifest['files'],ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
        replace_file(temporary_script, script)
    cooldown = {'until': 0, 'next_request': 0}
    cooldown_lock = threading.Lock()
    quota_exhausted = threading.Event()
    def wait_for_quota():
        while True:
            with cooldown_lock:
                now = time.monotonic()
                remaining = max(cooldown['until'], cooldown['next_request']) - now
                if remaining <= 0:
                    cooldown['next_request'] = now + 60 / args.requests_per_minute + .2
                    return
            time.sleep(min(remaining, 30))
    def generate(line):
        target = out/(hashlib.sha256(line['text'].encode()).hexdigest()[:16]+'.wav')
        reused = valid_audio(target)
        if not reused:
            if quota_exhausted.is_set():
                raise RuntimeError(f'{line["text"]}: daily quota exhausted; no request made (credentials omitted)')
            if args.model.startswith('gemini-3.'):
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions'
                payload = {'model':args.model,'input':[{'type':'user_input','content':[{'type':'text','text':line['spoken'],'annotations':[{'type':'speech_metadata','style':STYLE}]}]}], 'response_format':{'type':'audio'}, 'generation_config':{'speech_config':[{'voice':'Kore'}]}}
            else:
                endpoint = f'https://generativelanguage.googleapis.com/v1beta/models/{args.model}:generateContent'
                payload = {'contents':[{'parts':[{'text':STYLE+'\nText: '+line['spoken']}]}], 'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'prebuiltVoiceConfig':{'voiceName':'Kore'}}}}}
            for attempt in range(8):
                try:
                    wait_for_quota()
                    if quota_exhausted.is_set():
                        raise RuntimeError('Daily quota exhausted; no request made')
                    request = urllib.request.Request(endpoint,json.dumps(payload).encode(),headers={'Content-Type':'application/json','x-goog-api-key':key})
                    with urllib.request.urlopen(request, timeout=90) as response: result = json.load(response)
                    if args.model.startswith('gemini-3.'):
                        audio = [c for step in result.get('steps',[]) for c in step.get('content',[]) if c.get('type')=='audio'][-1]
                        raw = base64.b64decode(audio['data'])
                    else:
                        audio = next(p['inlineData'] for p in result['candidates'][0]['content']['parts'] if 'inlineData' in p)
                        raw = base64.b64decode(audio['data'])
                    temporary = target.with_suffix('.wav.tmp')
                    if raw[:4] == b'RIFF':
                        temporary.write_bytes(raw)
                    else:
                        with wave.open(str(temporary),'wb') as wav:
                            wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(24000); wav.writeframes(raw)
                    if not valid_audio(temporary):
                        temporary.unlink(missing_ok=True)
                        raise ValueError('Silent narration')
                    temporary.replace(target)
                    break
                except Exception as error:
                    status = getattr(error, 'code', None)
                    if quota_exhausted.is_set():
                        raise RuntimeError(f'{line["text"]}: daily quota exhausted (credentials omitted)') from None
                    if status == 429:
                        # Inspect quota identifiers internally; never print
                        # response bodies, headers, or credential material.
                        details = error.read().decode('utf-8', errors='replace')
                        if re.search(r'per.?day|daily', details, re.IGNORECASE):
                            quota_exhausted.set()
                            raise RuntimeError(f'{line["text"]}: daily quota exhausted (credentials omitted)') from None
                    if attempt == 7 or (status and status not in (408, 429, 500, 502, 503, 504)):
                        raise RuntimeError(f'{line["text"]}: {type(error).__name__}, HTTP {status or "n/a"} (credentials omitted)') from None
                    delay = min(60, 3 * 2 ** attempt)
                    if status == 429:
                        try:
                            delay = max(delay, float(error.headers.get('Retry-After', 0)))
                        except (TypeError, ValueError):
                            pass
                        if delay > 3600:
                            quota_exhausted.set()
                            raise RuntimeError(f'{line["text"]}: API quota cooldown exceeds one hour; requests halted (credentials omitted)') from None
                        with cooldown_lock:
                            cooldown['until'] = max(cooldown['until'], time.monotonic() + delay)
                        print(f'Quota cooldown {delay:.0f}s; retry {attempt+1}/7 for {line["text"]}', flush=True)
                    else:
                        time.sleep(delay)
        trim_silence(target)
        return line['text'], folder+'/'+target.name, reused
    print(f'Narration scope: {len(selected)} clips, up to {args.workers} requests in parallel, paced at {args.requests_per_minute:g}/minute.', flush=True)
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(generate, line) for line in selected]
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                text, file, reused = future.result()
                manifest['files'][text] = file
                try:
                    save_manifest()
                except OSError as error:
                    # Preserve progress in memory and continue publishing on
                    # the next completion instead of silently waiting for all
                    # outstanding API requests after a filesystem exception.
                    print(f'Manifest publication delayed: {type(error).__name__} (credentials omitted).', flush=True)
                print(f'{i}/{len(selected)} {text} ({"reused" if reused else "generated"})', flush=True)
            except RuntimeError as error:
                failures.append(str(error))
                print(f'{i}/{len(selected)} Failed: {error}', flush=True)
            except Exception as error:
                failures.append(type(error).__name__)
                print(f'{i}/{len(selected)} Failed: {type(error).__name__} (credentials omitted).', flush=True)
    save_manifest()
    if failures:
        raise SystemExit(f'{len(failures)} clips failed; rerun to resume. Credentials omitted.')

if __name__=='__main__': main()
