"""Create lightweight WebP delivery copies; preserve original generated PNGs."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
scenes = ['azusa', 'sakura', 'narita-express', 'marunouchi', 'rapit', 'wakashio',
          'keikyu', 'sonic', 'nemuro', 'hitachi', 'heisei-chikuho', 'yufuin', 'yokosuka', 'dog-train', 'inaho', 'kinugawa', 'nichirin', 'tenhama', 'hokuto',
          'numajiri', 'rumoi', 'red-arrow', 'ueno-tokyo-story', 'rinkai-story']
rewards = ['reward_azusa', 'reward_sakura', 'reward_narita-express', 'reward_marunouchi', 'reward_rapit']
before = after = 0
for folder, names in [('trains', scenes), ('rewards', rewards)]:
    for name in names:
        source = root / 'assets' / folder / (name + '.png')
        target = source.with_suffix('.webp')
        with Image.open(source) as image:
            image.save(target, 'WEBP', quality=88, method=6)
        before += source.stat().st_size
        after += target.stat().st_size
print(f'{len(scenes) + len(rewards)} delivery images: {before:,} -> {after:,} bytes; original PNGs preserved.')
