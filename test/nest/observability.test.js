const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createTraceparent,
  log,
  normalizeTraceIdForTraceparent,
} = require('../../src/middlewares/logger');

test('structured logs include service, environment, requestId and traceId metadata', () => {
  const previousServiceName = process.env.SERVICE_NAME;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousConsoleLog = console.log;
  let output;

  process.env.SERVICE_NAME = 'observability-test-service';
  process.env.NODE_ENV = 'test';
  console.log = (value) => {
    output = value;
  };

  try {
    log('info', 'observability smoke', {
      requestId: 'request-observability-test',
      traceId: 'trace-observability-test',
    });

    const entry = JSON.parse(output);
    assert.equal(entry.service, 'observability-test-service');
    assert.equal(entry.environment, 'test');
    assert.equal(entry.requestId, 'request-observability-test');
    assert.equal(entry.traceId, 'trace-observability-test');
  } finally {
    console.log = previousConsoleLog;
    if (previousServiceName === undefined) {
      delete process.env.SERVICE_NAME;
    } else {
      process.env.SERVICE_NAME = previousServiceName;
    }
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test('traceparent helper renders W3C-compatible headers', () => {
  assert.equal(
    normalizeTraceIdForTraceparent('4bf92f3577b34da6a3ce929d0e0e4736'),
    '4bf92f3577b34da6a3ce929d0e0e4736'
  );
  assert.match(createTraceparent('trace-id-from-legacy-header'), /^00-[a-f0-9]{32}-[a-f0-9]{16}-01$/);
});
