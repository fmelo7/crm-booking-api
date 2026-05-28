const fs = require('node:fs');
const path = require('node:path');

const packageJson = require('../package.json');
const distDir = path.join(__dirname, '..', 'dist');

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  path.join(distDir, 'build-info.json'),
  JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      builtAt: new Date().toISOString(),
    },
    null,
    2
  )
);
