import { mkdir, cp } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', '.nojekyll', 'manifest.webmanifest', 'sw.js', 'src', 'assets', 'vendor']) await cp(file, `dist/${file}`, {
  recursive: true,
  filter: source => {
    const path = relative(resolve('.'), resolve(source)).replaceAll('\\', '/');
    return !path.startsWith('assets/voice/announcements/') && path !== 'assets/voice/announcements' &&
      !(path.startsWith('assets/voice/announcements-lite/') && path.endsWith('.wav'));
  },
});
console.log('Built static site in dist/ (also directly publishable from main /).');
