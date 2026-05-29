const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const files = fs
  .readdirSync(publicDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

assert.ok(files.length > 0, 'expected public contract JSON files');

const requiredOpenApiFiles = new Set([
  'appointments.openapi.json',
  'customers.openapi.json',
  'gateway.openapi.json',
  'professionals.openapi.json',
  'services.openapi.json',
]);

const requiredEventFiles = new Set([
  'appointment-events.schema.json',
  'customer-events.schema.json',
  'professional-events.schema.json',
  'service-events.schema.json',
]);

for (const file of files) {
  const contract = JSON.parse(
    fs.readFileSync(path.join(publicDir, file), 'utf8')
  );

  if (file.endsWith('.openapi.json')) {
    assert.equal(contract.openapi, '3.1.0', `${file} must use OpenAPI 3.1.0`);
    assert.ok(contract.info?.title, `${file} must have info.title`);
    assert.ok(contract.info?.version, `${file} must have info.version`);
    assert.ok(
      Object.keys(contract.paths || {}).length > 0,
      `${file} must define paths`
    );
  }

  if (file.endsWith('-events.schema.json')) {
    assert.equal(
      contract.$schema,
      'https://json-schema.org/draft/2020-12/schema',
      `${file} must use JSON Schema 2020-12`
    );
    assert.ok(contract.title, `${file} must have title`);
    assert.ok(Array.isArray(contract.oneOf), `${file} must define oneOf`);
    assert.ok(contract.$defs?.EventMetadata, `${file} must define metadata`);
  }
}

for (const file of requiredOpenApiFiles) {
  assert.ok(files.includes(file), `missing ${file}`);
}

for (const file of requiredEventFiles) {
  assert.ok(files.includes(file), `missing ${file}`);
}
