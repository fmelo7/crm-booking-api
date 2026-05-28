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

const walkJsFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walkJsFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });

test('source extraction roadmap is present and tracks phase 4', () => {
  const roadmap = fs.readFileSync(path.join(rootDir, 'infra/source-extraction-roadmap.md'), 'utf8');

  assert.match(roadmap, /Status atual: fase 4 concluida/);
  assert.match(roadmap, /infra\/source-extraction-manifest\.json/);
  assert.match(roadmap, /Runtime comum minimo/);
  assert.match(roadmap, /Contratos como pacote independente/);
  assert.match(roadmap, /Primeiro dominio real: appointments/);
});

test('api-gateway seed contains real standalone gateway runtime', () => {
  const gatewayDir = path.join(rootDir, 'infra/repository-seeds/api-gateway');
  const required = [
    'src/app/app.js',
    'src/app/gateway.js',
    'src/app/serviceProxy.js',
    'src/app/server.js',
    'src/app/index.js',
  ];
  const missing = required
    .filter((file) => !fs.existsSync(path.join(gatewayDir, file)));
  const packageJson = JSON.parse(fs.readFileSync(path.join(gatewayDir, 'package.json'), 'utf8'));
  const dockerfile = fs.readFileSync(path.join(gatewayDir, 'Dockerfile'), 'utf8');
  const appFactory = require('../../infra/repository-seeds/api-gateway/src/app');

  assert.deepEqual(missing, []);
  assert.equal(packageJson.scripts.start, 'node src/app/server.js');
  assert.equal(typeof packageJson.dependencies.express, 'string');
  assert.equal(typeof packageJson.dependencies.dotenv, 'string');
  assert.match(dockerfile, /CMD \["node", "src\/app\/server\.js"\]/);
  assert.equal(typeof appFactory, 'function');
});

test('api-gateway seed runtime does not import monorepo or domain code', () => {
  const gatewaySrc = path.join(rootDir, 'infra/repository-seeds/api-gateway/src');
  const files = walkJsFiles(gatewaySrc);
  const violations = files.flatMap((file) => {
    const content = fs.readFileSync(file, 'utf8');
    return [
      /\.\.\/\.\.\/src\//,
      /\.\.\/\.\.\/packages\//,
      /src\/nest\/(appointment|customer|service|professional)/,
      /repository\.provider/,
      /packages\/domains/,
    ]
      .filter((pattern) => pattern.test(content))
      .map((pattern) => `${path.relative(rootDir, file)} matches ${pattern}`);
  });

  assert.deepEqual(violations, []);
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

test('backend and gateway manifests include local versioned contracts', () => {
  const repos = [
    'api-gateway',
    ...serviceRepos,
  ];
  const violations = repos.flatMap((repo) => {
    const copied = manifest.repos[repo].copy.map((entry) => `${entry.from}:${entry.to}`);

    return copied.includes('packages/contracts:src/contracts')
      ? []
      : [`${repo} is missing packages/contracts -> src/contracts`];
  });

  assert.deepEqual(violations, []);
});

test('backend seeds contain local runtime copied in phase 2', () => {
  const backendRepos = [
    'api-gateway',
    ...serviceRepos,
  ];
  const required = [
    'src/common/internalServiceAuth.js',
    'src/config/database.js',
    'src/config/postgres.js',
    'src/config/serviceDatabase.js',
    'src/health.js',
    'src/middlewares/logger.js',
    'src/middlewares/security.js',
    'src/nest/common/module.js',
    'src/nest/health/health.controller.js',
    'src/observability/metrics.js',
    'src/shared/common/databaseProvider.js',
  ];

  const missing = backendRepos.flatMap((repo) =>
    required
      .filter((file) => !pathExists(path.join('infra/repository-seeds', repo, file)))
      .map((file) => `${repo} missing ${file}`)
  );

  assert.deepEqual(missing, []);
});

test('phase 2 runtime copied into seeds does not import monorepo src or packages', () => {
  const backendRepos = [
    'api-gateway',
    ...serviceRepos,
  ];
  const violations = backendRepos.flatMap((repo) => {
    const srcDir = path.join(rootDir, 'infra/repository-seeds', repo, 'src');
    const files = walkJsFiles(srcDir);

    return files.flatMap((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return [
        /\.\.\/\.\.\/src\//,
        /\.\.\/\.\.\/packages\//,
        /require\(['"].*packages\//,
      ]
        .filter((pattern) => pattern.test(content))
        .map((pattern) => `${path.relative(rootDir, file)} matches ${pattern}`);
    });
  });

  assert.deepEqual(violations, []);
});

test('contracts seed contains real package entrypoint, schemas and public specs', () => {
  const contractsDir = path.join(rootDir, 'infra/repository-seeds/contracts');
  const required = [
    'index.js',
    'appointment.constants.js',
    'appointment.errors.js',
    'appointment.events.js',
    'appointment.schemas.js',
    'public/gateway.openapi.json',
    'public/appointments.openapi.json',
    'public/customers.openapi.json',
    'public/services.openapi.json',
    'public/professionals.openapi.json',
    'public/appointment-events.schema.json',
    'public/customer-events.schema.json',
    'public/service-events.schema.json',
    'public/professional-events.schema.json',
  ];
  const missing = required
    .filter((file) => !fs.existsSync(path.join(contractsDir, file)));
  const packageJson = JSON.parse(fs.readFileSync(path.join(contractsDir, 'package.json'), 'utf8'));
  const contracts = require('../../infra/repository-seeds/contracts');

  assert.deepEqual(missing, []);
  assert.equal(packageJson.main, 'index.js');
  assert.equal(typeof packageJson.dependencies.zod, 'string');
  assert.equal(typeof contracts.appointmentEventSchema.parse, 'function');
});

test('backend seeds consume contracts from local src/contracts without monorepo package imports', () => {
  const repos = [
    'api-gateway',
    ...serviceRepos,
  ];
  const violations = repos.flatMap((repo) => {
    const contractsDir = path.join(rootDir, 'infra/repository-seeds', repo, 'src/contracts');
    const files = walkJsFiles(contractsDir);
    const missing = [
      'index.js',
      'appointment.schemas.js',
      'public/gateway.openapi.json',
    ]
      .filter((file) => !fs.existsSync(path.join(contractsDir, file)))
      .map((file) => `${repo} missing src/contracts/${file}`);
    const forbiddenImports = files.flatMap((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return [/\.\.\/\.\.\/packages\/contracts/, /require\(['"].*packages\/contracts/]
        .filter((pattern) => pattern.test(content))
        .map((pattern) => `${path.relative(rootDir, file)} matches ${pattern}`);
    });

    return [...missing, ...forbiddenImports];
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
