"""Generate all app narration with Gemini 3.8 Flash-Lite TTS using resumable batches.
Commands: pilot, submit, collect. Supply --key-file or GEMINI_API_KEY.
Job records contain identifiers and fixed app text only, never credentials.
"""
import argparse, base64, hashlib, importlib.util, json, os, re, time, urllib.request, urllib.error, urllib.parse, wave
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
MODEL='gemini-3.8-flash-lite-tts'
OUT=ROOT/'assets/voice/announcements-lite'
JOBS=ROOT/'.tools/voice-batch-jobs.json'
spec=importlib.util.spec_from_file_location('voice_generation',ROOT/'scripts/generate-announcements.py')
generation=importlib.util.module_from_spec(spec);spec.loader.exec_module(generation)

def save_json(path, value):
    temporary=path.with_suffix(path.suffix+'.tmp')
    temporary.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    generation.replace_file(temporary,path)

def cached_clip(line):
    if generation.valid_audio(OUT/filename(line)):return True
    # Published, validated MP3s remain reusable after local WAV cleanup.
    record=OUT/'manifest.json'
    if not record.exists():return False
    manifest=json.loads(record.read_text(encoding='utf-8'))
    expected='announcements-lite/'+filename(line).replace('.wav','.mp3')
    target=OUT/Path(expected).name
    return manifest.get('model')==MODEL and manifest.get('files',{}).get(line['text'])==expected and target.exists() and target.stat().st_size>256

def inline_results(result):
    # REST batch resources use output; operations use response; SDK-shaped
    # resources use dest. REST inlinedResponses contains another list wrapper.
    for destination in [result.get('output',{}),result.get('response',{}),result.get('dest',{})]:
        if 'inlinedResponses' not in destination:continue
        inline=destination['inlinedResponses']
        if isinstance(inline,dict):inline=inline.get('inlinedResponses',[])
        if isinstance(inline,list):return inline
    return None

def payload(line):
    return {'contents':[{'parts':[{'text':line['spoken'],'speech_metadata':{'style':generation.STYLE}}]}],
            'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'prebuiltVoiceConfig':{'voiceName':'Kore'}}}}}

def filename(line): return hashlib.sha256(line['text'].encode()).hexdigest()[:16]+'.wav'

def main():
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('command',choices=['pilot','submit','collect']);parser.add_argument('--key-file',type=Path)
    args=parser.parse_args();secret=args.key_file.read_text(encoding='utf-8-sig').strip() if args.key_file else os.getenv('GEMINI_API_KEY','')
    match=re.search(r'AIza[\w-]+',secret);key=match.group(0) if match else secret
    if not key: raise SystemExit('Set GEMINI_API_KEY or --key-file.')
    OUT.mkdir(parents=True,exist_ok=True);JOBS.parent.mkdir(exist_ok=True)
    lines=json.loads((ROOT/'assets/voice/lines.json').read_text(encoding='utf-8'))['lines'];by_key={line['file'][:-4]:line for line in lines}
    def call(path,body=None):
        url=path if path.startswith('https://') else 'https://generativelanguage.googleapis.com/v1beta/'+path
        location=urllib.parse.urlparse(url)
        if location.scheme!='https' or location.hostname!='generativelanguage.googleapis.com' or location.username or location.password:
            raise SystemExit('Refusing to send credentials outside the Gemini API origin.')
        request=urllib.request.Request(url,None if body is None else json.dumps(body).encode(),headers={'Content-Type':'application/json','x-goog-api-key':key})
        try:
            with urllib.request.urlopen(request,timeout=120) as response:return json.load(response)
        except urllib.error.HTTPError as error:
            try: message=json.load(error).get('error',{}).get('message','')
            except Exception:message=''
            message=message.replace(key,'[redacted]')
            message=re.sub(r'AIza[\w-]+','[redacted]',message)
            raise SystemExit(f'HTTP {error.code}: {message[:700]}') from None
    def save_audio(line,response):
        if cached_clip(line):return
        audio=next(part['inlineData'] for part in response['candidates'][0]['content']['parts'] if 'inlineData' in part)
        raw=base64.b64decode(audio['data']);target=OUT/filename(line)
        temporary=target.with_suffix('.wav.tmp')
        if raw[:4]==b'RIFF':temporary.write_bytes(raw)
        else:
            with wave.open(str(temporary),'wb') as wav:
                wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(24000);wav.writeframes(raw)
        if not generation.valid_audio(temporary):temporary.unlink();raise ValueError('Silent generated audio: '+line['text'])
        for attempt in range(12):
            try:
                generation.trim_silence(temporary)
                break
            except PermissionError:
                if attempt==11:raise
                time.sleep(.25*(attempt+1))
        generation.replace_file(temporary,target)
    if args.command=='pilot':
        line=next(line for line in lines if line['text']==generation.VOICE_SAMPLE) if hasattr(generation,'VOICE_SAMPLE') else lines[0]
        if not cached_clip(line):
            response=call('models/'+MODEL+':generateContent',payload(line));save_audio(line,response)
        print('Flash-Lite pilot generated and verified:',line['text']);return
    jobs=json.loads(JOBS.read_text(encoding='utf-8')) if JOBS.exists() else {'model':MODEL,'jobs':[]}
    if jobs['model']!=MODEL:raise SystemExit('Job model differs; preserve the existing job record first.')
    if args.command=='submit':
        # A local write/trim failure is recovered by re-collecting the already
        # paid batch output. Only explicit API request errors may be regenerated.
        submitted=set()
        for job in jobs['jobs']:
            if job['state'] in ['failed','cancelled','expired']:continue
            for clip_key in job['keys']:
                if job['state']=='partial' and job.get('failure_reasons',{}).get(clip_key,'').startswith('API error '):continue
                submitted.add(clip_key)
        pending=[line for line in lines if not cached_clip(line) and line['file'][:-4] not in submitted]
        for start in range(0,len(pending),200):
            chunk=pending[start:start+200]
            requests=[{'request':payload(line),'metadata':{'key':line['file'][:-4]}} for line in chunk]
            response=call('models/'+MODEL+':batchGenerateContent',{'batch':{'display_name':'train-hiragana-voice-'+str(start),'input_config':{'requests':{'requests':requests}}}})
            name=response.get('name') or response.get('batch',{}).get('name')
            if not name:raise SystemExit('Batch response had no job name.')
            jobs['jobs'].append({'name':name,'keys':[line['file'][:-4] for line in chunk],'state':'submitted'})
            save_json(JOBS,jobs)
            print('Submitted',len(chunk),'clips:',name,flush=True)
        print('Queued jobs:',len(jobs['jobs']));return
    for job in jobs['jobs']:
        if job['state']=='collected' and all(cached_clip(by_key[key]) for key in job['keys']):continue
        result=call(job['name']);metadata=result.get('metadata',{})
        state=metadata.get('state') or result.get('state') or 'unknown'
        job['api_state']=state
        print(job['name'],state,flush=True)
        terminal=state.rsplit('_',1)[-1]
        if terminal in ['FAILED','CANCELLED','EXPIRED'] or (result.get('done') and result.get('error')):
            job['state']=terminal.lower() if terminal in ['FAILED','CANCELLED','EXPIRED'] else 'failed'
            job['failed_keys']=[key for key in job['keys'] if not cached_clip(by_key[key])]
            save_json(JOBS,jobs)
            print('Terminal job failure; clips eligible for resubmission:',len(job['failed_keys']),flush=True)
            continue
        inline=inline_results(result)
        if inline is None:
            if terminal=='SUCCEEDED' or result.get('done'):
                print('Completed job has no supported inline output; preserve job for schema inspection.',flush=True)
            save_json(JOBS,jobs)
            continue
        expected=set(job['keys']);errors={}
        for index,item in enumerate(inline):
            clip_key=item.get('metadata',{}).get('key') or item.get('key')
            # The REST reference guarantees input order; use it only when the
            # result count is complete, avoiding misassigning incomplete lists.
            if not clip_key and len(inline)==len(job['keys']):clip_key=job['keys'][index]
            if clip_key not in expected:
                print('Ignored response with an unknown request key.',flush=True);continue
            if 'response' not in item:
                errors[clip_key]='API error '+str(item.get('error',{}).get('code','unknown'));continue
            try:save_audio(by_key[clip_key],item['response'])
            except (ValueError,KeyError,StopIteration,OSError,EOFError,wave.Error) as error:
                errors[clip_key]=type(error).__name__
        missing=[key for key in job['keys'] if not cached_clip(by_key[key])]
        complete=terminal=='SUCCEEDED' or result.get('done',False)
        job['state']='collected' if not missing else 'partial' if complete else 'running'
        job['failed_keys']=missing;job['failure_reasons']=errors
        save_json(JOBS,jobs)
        print('Verified',len(job['keys'])-len(missing),'/',len(job['keys']),'clips; missing or failed:',len(missing),flush=True)
    print('Valid Flash-Lite files:',sum(cached_clip(line) for line in lines),'/',len(lines))

if __name__=='__main__':main()
