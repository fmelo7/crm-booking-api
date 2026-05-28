const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');

const walkFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });

const read = (file) => fs.readFileSync(file, 'utf8');

const relative = (file) => path.relative(rootDir, file);

const assertFilesDoNotContain = (files, patterns, message) => {
  const violations = files.flatMap((file) => {
    const content = read(file);
    return patterns
      .filter((pattern) => pattern.test(content))
      .map((pattern) => `${relative(file)} matches ${pattern}`);
  });

  assert.deepEqual(violations, [], message);
};

test('contracts do not import runtime, database or domain implementation code', () => {
  const files = walkFiles(path.join(rootDir, 'packages/contracts'));

  assertFilesDoNotContain(files, [
    /require\(['"].*src\//,
    /require\(['"].*packages\/domains\//,
    /require\(['"].*@nestjs\//,
    /require\(['"]mongoose['"]\)/,
    /require\(['"]pg['"]\)/,
  ], 'contracts must remain stable and infrastructure-free');
});

test('appointment pure domain layers do not import infrastructure or NestJS', () => {
  const files = [
    ...walkFiles(path.join(rootDir, 'packages/domains/appointment/rules')),
    ...walkFiles(path.join(rootDir, 'packages/domains/appointment/validation')),
  ];

  assertFilesDoNotContain(files, [
    /require\(['"].*@nestjs\//,
    /require\(['"]mongoose['"]\)/,
    /require\(['"]pg['"]\)/,
    /require\(['"].*infrastructure\//,
    /require\(['"].*src\/nest\//,
  ], 'appointment rules/validation must stay independent from infra and HTTP runtime');
});

test('service apps do not import each other directly', () => {
  const serviceDirs = [
    'appointments-service',
    'customers-service',
    'services-service',
    'professionals-service',
  ];

  const violations = serviceDirs.flatMap((serviceDir) => {
    const files = walkFiles(path.join(rootDir, 'apps', serviceDir));
    const otherServices = serviceDirs.filter((other) => other !== serviceDir);

    return files.flatMap((file) => {
      const content = read(file);
      return otherServices
        .filter((other) => content.includes(`apps/${other}`) || content.includes(`../${other}`))
        .map((other) => `${relative(file)} imports ${other}`);
    });
  });

  assert.deepEqual(violations, [], 'microservice apps must communicate by APIs/events, not imports');
});

test('service app modules expose only their own domain plus health', () => {
  const appModules = [
    {
      file: 'apps/appointments-service/src/app.module.js',
      allowed: ['src/nest/appointment/appointment.standalone.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/customers-service/src/app.module.js',
      allowed: ['src/nest/customer/customer.standalone.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/services-service/src/app.module.js',
      allowed: ['src/nest/service/service.standalone.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/professionals-service/src/app.module.js',
      allowed: ['src/nest/professional/professional.standalone.module', 'src/nest/health/health.module'],
    },
  ];

  const forbiddenModules = [
    'src/nest/appointment/appointment.module',
    'src/nest/appointment/appointment.standalone.module',
    'src/nest/customer/customer.module',
    'src/nest/customer/customer.standalone.module',
    'src/nest/service/service.module',
    'src/nest/service/service.standalone.module',
    'src/nest/professional/professional.module',
    'src/nest/professional/professional.standalone.module',
  ];

  const violations = appModules.flatMap(({ file, allowed }) => {
    const content = read(path.join(rootDir, file));

    return forbiddenModules
      .filter((modulePath) => !allowed.includes(modulePath))
      .filter((modulePath) => content.includes(modulePath))
      .map((modulePath) => `${file} imports ${modulePath}`);
  });

  assert.deepEqual(violations, [], 'service app modules must not expose other domain modules');
});

test('standalone service modules do not import repositories from other domains', () => {
  const moduleFiles = [
    {
      file: 'src/nest/appointment/appointment.standalone.module.js',
      forbidden: [
        /customer\.repository\.provider/,
        /service\.repository\.provider/,
        /professional\.repository\.provider/,
      ],
    },
    {
      file: 'src/nest/customer/customer.standalone.module.js',
      forbidden: [
        /appointment\.repository\.provider/,
        /service\.repository\.provider/,
        /professional\.repository\.provider/,
      ],
    },
    {
      file: 'src/nest/service/service.standalone.module.js',
      forbidden: [
        /appointment\.repository\.provider/,
        /customer\.repository\.provider/,
        /professional\.repository\.provider/,
      ],
    },
    {
      file: 'src/nest/professional/professional.standalone.module.js',
      forbidden: [
        /appointment\.repository\.provider/,
        /customer\.repository\.provider/,
        /service\.repository\.provider/,
      ],
    },
  ];

  const violations = moduleFiles.flatMap(({ file, forbidden }) => {
    const content = read(path.join(rootDir, file));
    return forbidden
      .filter((pattern) => pattern.test(content))
      .map((pattern) => `${file} matches ${pattern}`);
  });

  assert.deepEqual(violations, [], 'standalone service modules must wire only their own repositories');
});

test('repository providers import only their own domain implementation', () => {
  const repositoryProviders = [
    {
      file: 'src/nest/appointment/appointment.repository.provider.js',
      allowed: 'packages/domains/appointment/',
    },
    {
      file: 'src/nest/customer/customer.repository.provider.js',
      allowed: 'packages/domains/customer/',
    },
    {
      file: 'src/nest/service/service.repository.provider.js',
      allowed: 'packages/domains/service/',
    },
    {
      file: 'src/nest/professional/professional.repository.provider.js',
      allowed: 'packages/domains/professional/',
    },
  ];

  const violations = repositoryProviders.flatMap(({ file, allowed }) => {
    const content = read(path.join(rootDir, file));
    const imports = [...content.matchAll(/require\(['"]([^'"]*packages\/domains\/[^'"]+)['"]\)/g)]
      .map((match) => match[1]);

    return imports
      .filter((importPath) => !importPath.includes(allowed))
      .map((importPath) => `${file} imports ${importPath}`);
  });

  assert.deepEqual(violations, [], 'repository providers must stay scoped to their own domain');
});

test('service providers keep cross-domain repositories behind module composition', () => {
  const files = [
    'src/nest/appointment/appointment.provider.js',
    'src/nest/customer/customer.provider.js',
    'src/nest/service/service.provider.js',
    'src/nest/professional/professional.provider.js',
  ].map((file) => path.join(rootDir, file));

  assertFilesDoNotContain(files, [
    /require\(['"].*\.\.\/appointment\/appointment\.repository\.provider['"]\)/,
    /require\(['"].*\.\.\/customer\/customer\.repository\.provider['"]\)/,
    /require\(['"].*\.\.\/service\/service\.repository\.provider['"]\)/,
    /require\(['"].*\.\.\/professional\/professional\.repository\.provider['"]\)/,
  ], 'providers must not import repositories from other domains directly');
});
