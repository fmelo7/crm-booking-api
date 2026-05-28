const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');
const seedsDir = path.join(rootDir, 'infra/repository-seeds');

const repos = [
  'frontend',
  'api-gateway',
  'appointments-service',
  'customers-service',
  'services-service',
  'professionals-service',
  'contracts',
  'infra',
];

const dockerRepos = [
  'frontend',
  'api-gateway',
  'appointments-service',
  'customers-service',
  'services-service',
  'professionals-service',
];

const read = (repo, workflow) =>
  fs.readFileSync(path.join(seedsDir, repo, '.github/workflows', workflow), 'utf8');

test('repository seeds include CI, release and rollback workflows', () => {
  const missing = repos.flatMap((repo) =>
    ['ci.yml', 'release.yml', 'rollback.yml']
      .filter((workflow) => !fs.existsSync(path.join(seedsDir, repo, '.github/workflows', workflow)))
      .map((workflow) => `${repo}/${workflow}`)
  );

  assert.deepEqual(missing, []);
});

test('CI workflows run on pull requests and validate build/test', () => {
  const violations = repos.flatMap((repo) => {
    const ci = read(repo, 'ci.yml');
    const required = ['pull_request:', 'npm ci', 'npm test', 'npm run build'];

    return required
      .filter((item) => !ci.includes(item))
      .map((item) => `${repo}/ci.yml missing ${item}`);
  });

  assert.deepEqual(violations, []);
});

test('Docker app releases publish versioned images', () => {
  const violations = dockerRepos.flatMap((repo) => {
    const release = read(repo, 'release.yml');
    const required = [
      'tags:',
      '"v*.*.*"',
      'ghcr.io/${{ github.repository }}',
      'docker/metadata-action',
      'docker/build-push-action',
      'push: true',
      'type=ref,event=tag',
      'type=sha',
      'DEPLOY_WEBHOOK_URL',
    ];

    return required
      .filter((item) => !release.includes(item))
      .map((item) => `${repo}/release.yml missing ${item}`);
  });

  assert.deepEqual(violations, []);
});

test('Rollback workflows are manual and require previous version input', () => {
  const violations = repos.flatMap((repo) => {
    const rollback = read(repo, 'rollback.yml');
    const expectedInput = dockerRepos.includes(repo) ? 'image_tag:' : 'release_tag:';
    const required = ['workflow_dispatch:', expectedInput, 'ROLLBACK'];

    return required
      .filter((item) => !rollback.includes(item))
      .map((item) => `${repo}/rollback.yml missing ${item}`);
  });

  assert.deepEqual(violations, []);
});

test('Deployment docs keep secrets outside committed configuration', () => {
  const docs = fs.readFileSync(path.join(rootDir, 'infra/deployment-and-rollback.md'), 'utf8');
  const examples = repos
    .map((repo) => path.join(seedsDir, repo, '.env.example'))
    .filter(fs.existsSync)
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  assert.match(docs, /Nenhum secret real deve ser commitado/);
  assert.doesNotMatch(examples, /DEPLOY_WEBHOOK_TOKEN=.+/);
  assert.doesNotMatch(examples, /ROLLBACK_WEBHOOK_TOKEN=.+/);
});
