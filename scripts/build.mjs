import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', '.nojekyll', 'manifest.webmanifest', 'sw.js', 'src', 'assets', 'vendor']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Built static site in dist/ (also directly publishable from main /).');
