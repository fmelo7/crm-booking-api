const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');

test('monorepo retirement rule keeps current status blocked while external evidence is pending', () => {
  const criteria = fs.readFileSync(path.join(rootDir, 'infra/completion-criteria.md'), 'utf8');
  const runbook = fs.readFileSync(path.join(rootDir, 'infra/monorepo-retirement.md'), 'utf8');

  assert.match(criteria, /Status atual: em migracao/);
  assert.match(criteria, /Decisao atual em 2026-05-28: nao aposentar ainda/);
  assert.match(criteria, /URLs remotas ainda marcadas como `Pendente`/);
  assert.match(criteria, /Enquanto qualquer item critico estiver `Bloqueado`, `Parcial` ou `Pendente`/);
  assert.match(runbook, /Status: nao aposentar ainda/);
  assert.match(runbook, /Se qualquer item critico estiver pendente/);
});

test('monorepo retirement runbook covers all final decision criteria', () => {
  const runbook = fs.readFileSync(path.join(rootDir, 'infra/monorepo-retirement.md'), 'utf8');
  const required = [
    'Repositorios remotos existem',
    'CI remoto passa',
    'Build/test fora do monorepo passa',
    'Imagens publicadas',
    'Contratos publicados',
    'Bancos/schemas proprios em uso',
    'Gateway e frontend independentes',
    'Deploy independente testado',
    'Rollback independente testado',
    'Observabilidade fim a fim',
  ];

  const missing = required.filter((item) => !runbook.includes(item));

  assert.deepEqual(missing, []);
});
