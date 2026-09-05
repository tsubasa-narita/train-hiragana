"""Generate fixed app phrases only; no credentials or child data are used.
Requires edge-tts==7.2.8. Existing completed files are reused.
"""
import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'voice'
manifest = json.loads((OUT / 'lines.json').read_text(encoding='utf-8'))

async def main():
    semaphore = asyncio.Semaphore(3)
    completed = 0

    async def generate(line):
        nonlocal completed
        target = OUT / line['file']
        async with semaphore:
            if not target.exists() or target.stat().st_size < 1000:
                temporary = target.with_suffix('.partial')
                for attempt in range(3):
                    try:
                        task = edge_tts.Communicate(line['spoken'], manifest['voice'], rate=manifest['rate'], pitch=manifest['pitch'])
                        await asyncio.wait_for(task.save(str(temporary)), timeout=40)
                        if temporary.stat().st_size < 1000:
                            raise ValueError('Empty audio')
                        temporary.replace(target)
                        break
                    except Exception:
                        if attempt == 2:
                            raise
                        await asyncio.sleep(2 * (attempt + 1))
            completed += 1
            if completed % 10 == 0 or completed == len(manifest['lines']):
                print(f"Generated {completed}/{len(manifest['lines'])}", flush=True)

    await asyncio.gather(*(generate(line) for line in manifest['lines']))

asyncio.run(main())
