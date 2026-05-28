const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const requiredAssets = [
  'index.html',
  'app.js',
  'styles.css',
];
const missing = requiredAssets
  .filter((file) => !fs.existsSync(path.join(publicDir, file)));

if (missing.length) {
  throw new Error(`Missing frontend assets: ${missing.join(', ')}`);
}

fs.mkdirSync(distDir, { recursive: true });
requiredAssets.forEach((file) => {
  fs.copyFileSync(path.join(publicDir, file), path.join(distDir, file));
});
