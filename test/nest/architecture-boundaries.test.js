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
      allowed: ['src/nest/appointment/appointment.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/customers-service/src/app.module.js',
      allowed: ['src/nest/customer/customer.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/services-service/src/app.module.js',
      allowed: ['src/nest/service/service.module', 'src/nest/health/health.module'],
    },
    {
      file: 'apps/professionals-service/src/app.module.js',
      allowed: ['src/nest/professional/professional.module', 'src/nest/health/health.module'],
    },
  ];

  const forbiddenModules = [
    'src/nest/appointment/appointment.module',
    'src/nest/customer/customer.module',
    'src/nest/service/service.module',
    'src/nest/professional/professional.module',
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
