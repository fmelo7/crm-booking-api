const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');
const manifest = require('../../infra/source-extraction-manifest.json');

const serviceRepos = [
  'appointments-service',
  'customers-service',
  'services-service',
  'professionals-service',
];

const domainNames = ['appointment', 'customer', 'service', 'professional'];

const pathExists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));

test('source extraction roadmap is present and tracks phase 1', () => {
  const roadmap = fs.readFileSync(path.join(rootDir, 'infra/source-extraction-roadmap.md'), 'utf8');

  assert.match(roadmap, /Status atual: fase 1 concluida/);
  assert.match(roadmap, /infra\/source-extraction-manifest\.json/);
  assert.match(roadmap, /Runtime comum minimo/);
  assert.match(roadmap, /Primeiro dominio real: appointments/);
});

test('source extraction manifest covers every repository seed', () => {
  const expectedRepos = [
    'contracts',
    'api-gateway',
    'appointments-service',
    'customers-service',
    'services-service',
    'professionals-service',
    'frontend',
    'infra',
  ];

  assert.deepEqual(Object.keys(manifest.repos).sort(), expectedRepos.sort());
});

test('source extraction manifest references existing source paths and safe targets', () => {
  const violations = Object.entries(manifest.repos).flatMap(([repo, config]) =>
    config.copy.flatMap(({ from, to }) => {
      const errors = [];

      if (!pathExists(from)) {
        errors.push(`${repo} references missing source ${from}`);
      }

      if (path.isAbsolute(to) || to.split(/[\\/]/).includes('..')) {
        errors.push(`${repo} has unsafe target ${to}`);
      }

      return errors;
    })
  );

  assert.deepEqual(violations, []);
});

test('backend service manifests copy only their own domain implementation', () => {
  const violations = serviceRepos.flatMap((repo) => {
    const config = manifest.repos[repo];
    const allowed = new Set(config.allowedDomains);
    const copiedDomains = config.copy
      .map((entry) => entry.from.match(/^packages\/domains\/([^/]+)/)?.[1])
      .filter(Boolean);

    return copiedDomains
      .filter((domain) => !allowed.has(domain))
      .map((domain) => `${repo} copies forbidden domain ${domain}`);
  });

  assert.deepEqual(violations, []);
});

test('backend service manifests include runtime, health, observability and shared helpers', () => {
  const violations = serviceRepos.flatMap((repo) => {
    const copied = manifest.repos[repo].copy.map((entry) => entry.from);
    const required = [
      'src/config',
      'src/health.js',
      'src/middlewares',
      'src/nest/common',
      'src/nest/health',
      'src/observability',
      'packages/shared/common',
    ];

    return required
      .filter((item) => !copied.includes(item))
      .map((item) => `${repo} is missing ${item}`);
  });

  assert.deepEqual(violations, []);
});

test('each domain appears in exactly one backend service manifest', () => {
  const owners = domainNames.reduce((acc, domain) => ({ ...acc, [domain]: [] }), {});

  serviceRepos.forEach((repo) => {
    manifest.repos[repo].copy.forEach((entry) => {
      const domain = entry.from.match(/^packages\/domains\/([^/]+)/)?.[1];
      if (domain) owners[domain].push(repo);
    });
  });

  assert.deepEqual(owners, {
    appointment: ['appointments-service'],
    customer: ['customers-service'],
    service: ['services-service'],
    professional: ['professionals-service'],
  });
});
