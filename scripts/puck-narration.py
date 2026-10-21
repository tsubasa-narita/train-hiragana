"""Generate the auditioned Puck voice using resumable batches, then publish it.
Usage: python scripts/puck-narration.py submit|collect|publish [--lines PATH]
Credentials stay in GEMINI_API_KEY. Raw WAVs and batch jobs stay in .tools/.
"""
import argparse,base64,concurrent.futures,hashlib,importlib.util,json,os,struct,subprocess,sys,time,shutil,urllib.request,urllib.error,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
PROFILE=json.loads((ROOT/'scripts/puck-profile.json').read_text(encoding='utf-8'))
KANA_STYLE=PROFILE['style']+'; Japanese hiragana pronunciation lesson. Clearly enunciate ONLY the supplied Japanese kana syllable exactly once. Treat it as a Japanese syllable, never an English word or an interjection. No laughter, chuckles, singing, extra words or repetitions. Do not whisper.'
def delivery(line,repair=False):
    if len(line['text'])==1:return KANA_STYLE
    style=PROFILE['style']+'; Read ONLY the supplied Japanese text verbatim in Japanese. Never translate or paraphrase it. Do not drop syllables, add words, repeat or replace short kana with full words. Enunciate each word carefully.'
    if line['text'].startswith('「'):style+=' The quoted kana is one short Japanese mora. Do not elongate it or add a long vowel.'
    if line['text']=='はろーきてぃはるか':style+=' ハローキティ is Hello Kitty: pronounce キティ (ki-ti), never 来て (ki-te). Then say はるか.'
    return style
RAW=ROOT/'.tools/puck-audio';OUT=ROOT/'assets/voice/puck';JOBS=ROOT/'.tools/puck-batch-jobs.json'
spec=importlib.util.spec_from_file_location('audio_generation',ROOT/'scripts/generate-announcements.py')
audio=importlib.util.module_from_spec(spec);spec.loader.exec_module(audio)
def save(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    temporary=path.with_suffix(path.suffix+'.tmp')
    temporary.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');audio.replace_file(temporary,path)
def stem(line):return hashlib.sha256(line['text'].encode()).hexdigest()[:16]
def cached(line):
    path=RAW/(stem(line)+'.wav')
    return path.exists() and path.stat().st_size>1000

def finish_clip(temporary,target):
    for attempt in range(12):
        try:
            audio.trim_silence(temporary);audio.replace_file(temporary,target);return
        except PermissionError:
            if attempt==11:raise
            time.sleep(.25*(attempt+1))

def main():
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('command',choices=['submit','collect','publish']);parser.add_argument('--lines',type=Path,default=ROOT/'assets/voice/lines.json');parser.add_argument('--repair-keys',type=Path);parser.add_argument('--revision',type=int,default=1);args=parser.parse_args()
    lines=json.loads(args.lines.read_text(encoding='utf-8-sig'))['lines'];bykey={stem(l):l for l in lines}
    RAW.mkdir(parents=True,exist_ok=True)
    profilefile=RAW/'profile.json'
    if profilefile.exists() and json.loads(profilefile.read_text(encoding='utf-8'))!=PROFILE:raise SystemExit('Voice profile changed; never reuse incompatible recordings.')
    save(profilefile,PROFILE)
    # Recover already-paid output after a transient OneDrive/indexer lock.
    for line in lines:
        target=RAW/(stem(line)+'.wav');tmp=target.with_suffix('.wav.tmp')
        if not target.exists() and tmp.exists() and audio.valid_audio(tmp):finish_clip(tmp,target)
    if args.command=='publish':
        journal=json.loads(JOBS.read_text(encoding='utf-8')) if JOBS.exists() else {'jobs':[]}
        if any(j.get('repair_revision') and j['state']!='collected' and set(j['keys']) & set(bykey) for j in journal['jobs']):raise SystemExit('Unfinished repair jobs; publication refused.')
        missing=[l['text'] for l in lines if not cached(l)]
        if missing:raise SystemExit(f'{len(missing)} Puck recordings missing; publication refused.')
        sys.path.insert(0,str(ROOT/'.tools/audio-python'));import imageio_ffmpeg
        ffmpeg=imageio_ffmpeg.get_ffmpeg_exe();OUT.mkdir(parents=True,exist_ok=True)
        def encode(line):
            source=RAW/(stem(line)+'.wav');target=OUT/(stem(line)+'.mp3')
            if not target.exists() or source.stat().st_mtime>target.stat().st_mtime:
                if not audio.valid_audio(source):raise ValueError('Invalid source: '+line['text'])
                tmp=target.with_suffix('.tmp.mp3')
                subprocess.run([ffmpeg,'-nostdin','-hide_banner','-loglevel','error','-y','-i',str(source),'-codec:a','libmp3lame','-b:a','64k','-ar','24000','-ac','1',str(tmp)],check=True)
                audio.replace_file(tmp,target)
            pcm=subprocess.check_output([ffmpeg,'-nostdin','-hide_banner','-loglevel','error','-i',str(target),'-f','s16le','-ac','1','-ar','24000','pipe:1'])
            samples=struct.unpack('<'+'h'*(len(pcm)//2),pcm)
            if not samples or max(abs(x) for x in samples)<500:raise ValueError('Silent MP3: '+line['text'])
            return line['text'],'puck/'+target.name,{'text':line['text'],'duration':len(samples)/24000,'peak':max(abs(x) for x in samples)/32768}
        files={};quality=[]
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            for i,(text,file,stats) in enumerate(pool.map(encode,lines),1):
                files[text]=file;quality.append(stats)
                if i%200==0:print('Verified',i,'/',len(lines),flush=True)
        save(OUT/'manifest.json',{**PROFILE,'kana_style':KANA_STYLE,'codec':'MP3 64kbps 24kHz mono','files':files})
        target=ROOT/'src/announcement-manifest.js';tmp=target.with_suffix('.js.tmp')
        tmp.write_text('// Generated by scripts/puck-narration.py\nexport const NARRATION_PROFILE = '+json.dumps(PROFILE,ensure_ascii=False)+';\nexport const ANNOUNCEMENT_FILES = '+json.dumps(files,ensure_ascii=False,indent=2)+';\n',encoding='utf-8');audio.replace_file(tmp,target)
        save(ROOT/'.tools/puck-audio-quality.json',{'profile':PROFILE,'clips':quality})
        print('Published',len(files),'Puck clips.',flush=True);return
    key=os.getenv('GEMINI_API_KEY','')
    if not key:raise SystemExit('Set GEMINI_API_KEY.')
    def call(path,body=None):
        request=urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/'+path,None if body is None else json.dumps(body).encode(),headers={'Content-Type':'application/json','x-goog-api-key':key})
        try:
            with urllib.request.urlopen(request,timeout=180) as response:return json.load(response)
        except urllib.error.HTTPError as e:raise RuntimeError('Gemini HTTP '+str(e.code)+' (credentials omitted)') from None
    jobs=json.loads(JOBS.read_text(encoding='utf-8')) if JOBS.exists() else {'profile':PROFILE,'jobs':[]}
    if jobs['profile']!=PROFILE:raise SystemExit('Batch voice profile differs.')
    if args.command=='submit':
        repair_keys=set(json.loads(args.repair_keys.read_text(encoding='utf-8-sig'))) if args.repair_keys else None
        if repair_keys is not None and repair_keys-set(bykey):raise SystemExit('Unknown repair key.')
        eligible_jobs=[j for j in jobs['jobs'] if (j.get('repair_revision')==args.revision if repair_keys is not None else not j.get('repair_revision'))]
        reserved={k for j in eligible_jobs if j['state'] not in ['failed','cancelled','expired'] for k in j['keys'] if not(j['state']=='partial' and j.get('errors',{}).get(k,'').startswith('API '))}
        pending=[l for l in lines if (stem(l) in repair_keys if repair_keys is not None else not cached(l)) and stem(l) not in reserved]
        for start in range(0,len(pending),200):
            chunk=pending[start:start+200]
            job={'state':'submitting','keys':[stem(l) for l in chunk],**({'repair_revision':args.revision,'completed_keys':[]} if repair_keys is not None else {})};jobs['jobs'].append(job);save(JOBS,jobs)
            requests=[{'metadata':{'key':stem(l)},'request':{'contents':[{'parts':[{'text':l['spoken'],'speech_metadata':{'style':delivery(l,repair_keys is not None)}}]}],'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'languageCode':'ja-JP','voiceConfig':{'prebuiltVoiceConfig':{'voiceName':PROFILE['voice']}}}}}} for l in chunk]
            result=call('models/'+PROFILE['model']+':batchGenerateContent',{'batch':{'display_name':'train-hiragana-puck-'+str(len(jobs['jobs'])),'input_config':{'requests':{'requests':requests}}}})
            job['name']=result.get('name') or result.get('batch',{}).get('name')
            if not job['name']:raise SystemExit('Ambiguous batch response; preserved reservation.')
            job['state']='submitted';save(JOBS,jobs);print('Submitted',len(chunk),'Puck clips:',job['name'],flush=True)
        print('Pending recordings queued:',len(pending),flush=True);return
    for job in jobs['jobs']:
        relevant=[k for k in job['keys'] if k in bykey]
        if not relevant:continue
        repaired=job.get('repair_revision')
        complete_keys=set(job.get('completed_keys',[]))
        if all(k in complete_keys if repaired else cached(bykey[k]) for k in relevant):
            job['state']='collected';job['errors']={};save(JOBS,jobs);continue
        if not job.get('name'):raise SystemExit('A submission is ambiguous; inspect job record before resubmitting.')
        result=call(job['name']);state=result.get('metadata',{}).get('state') or result.get('state','unknown');job['api_state']=state
        print(job['name'],state,flush=True)
        terminal=state.rsplit('_',1)[-1]
        if terminal in ['FAILED','CANCELLED','EXPIRED'] or result.get('done') and result.get('error'):
            job['state']=terminal.lower() if terminal in ['FAILED','CANCELLED','EXPIRED'] else 'failed';save(JOBS,jobs);continue
        inline=None
        for dest in [result.get('output',{}),result.get('response',{}),result.get('dest',{})]:
            if 'inlinedResponses' in dest:
                inline=dest['inlinedResponses'];inline=inline.get('inlinedResponses',[]) if isinstance(inline,dict) else inline;break
        if inline is None:save(JOBS,jobs);continue
        errors={}
        for index,item in enumerate(inline):
            k=item.get('metadata',{}).get('key') or item.get('key')
            if not k and len(inline)==len(job['keys']):k=job['keys'][index]
            if k not in bykey or (k in complete_keys if repaired else cached(bykey[k])):continue
            if 'response' not in item:errors[k]='API '+str(item.get('error',{}).get('code','unknown'));continue
            try:
                part=next(p['inlineData'] for p in item['response']['candidates'][0]['content']['parts'] if 'inlineData' in p)
                raw=base64.b64decode(part['data']);target=RAW/(k+'.wav');tmp=target.with_suffix('.wav.tmp')
                if raw[:4]==b'RIFF':tmp.write_bytes(raw)
                else:
                    with wave.open(str(tmp),'wb') as wav:wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(24000);wav.writeframes(raw)
                if not audio.valid_audio(tmp):raise ValueError('Silent audio')
                if repaired and target.exists():
                    original=RAW/'originals'/(k+'.r'+str(repaired)+'.wav');original.parent.mkdir(exist_ok=True)
                    if not original.exists():shutil.copy2(target,original)
                finish_clip(tmp,target)
                if repaired:
                    complete_keys.add(k);job['completed_keys']=list(complete_keys);save(JOBS,jobs)
            except (ValueError,KeyError,StopIteration,OSError,wave.Error) as e:errors[k]=type(e).__name__
        missing=[k for k in relevant if (k not in complete_keys if repaired else not cached(bykey[k]))]
        job['state']='collected' if not missing else 'partial' if terminal=='SUCCEEDED' or result.get('done') else 'running'
        job['errors']=errors;save(JOBS,jobs);print('Verified',len(relevant)-len(missing),'/',len(relevant),flush=True)
    print('Available Puck recordings:',sum(cached(l) for l in lines),'/',len(lines),flush=True)
def run_exclusive():
    # Prevent submit/collect from overwriting each other's paid-job journal.
    lockpath=ROOT/'.tools/puck-jobs.lock';lockpath.parent.mkdir(parents=True,exist_ok=True)
    with lockpath.open('a+b') as lock:
        if lock.tell()==0:lock.write(b'0');lock.flush()
        lock.seek(0)
        try:
            if os.name=='nt':
                import msvcrt
                msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
            else:
                import fcntl
                fcntl.flock(lock.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
        except OSError:raise SystemExit('Another Puck generation command is active; wait for it to finish.') from None
        try:main()
        finally:
            lock.seek(0)
            if os.name=='nt':msvcrt.locking(lock.fileno(),msvcrt.LK_UNLCK,1)
            else:fcntl.flock(lock.fileno(),fcntl.LOCK_UN)

if __name__=='__main__':run_exclusive()
