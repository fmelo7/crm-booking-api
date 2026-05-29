const httpRequests = new Map();
const httpDurations = new Map();
const durationBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

const getServiceName = () =>
  (process.env.SERVICE_NAME || process.env.npm_package_name || 'serv365-api').trim();

const labelKey = (labels) => JSON.stringify(labels);

const increment = (map, labels, amount = 1) => {
  const key = labelKey(labels);
  const current = map.get(key) || { labels, value: 0 };
  current.value += amount;
  map.set(key, current);
};

const observeDuration = (labels, durationSeconds) => {
  durationBuckets.forEach((bucket) => {
    if (durationSeconds <= bucket) {
      increment(httpDurations, { ...labels, le: String(bucket) });
    }
  });

  increment(httpDurations, { ...labels, le: '+Inf' });
  increment(httpDurations, { ...labels, le: 'sum' }, durationSeconds);
  increment(httpDurations, { ...labels, le: 'count' });
};

const recordHttpRequest = ({ method, route, status, durationMs }) => {
  const labels = {
    service: getServiceName(),
    method,
    route,
    status: String(status),
  };

  increment(httpRequests, labels);
  observeDuration(labels, durationMs / 1000);
};

const formatLabels = (labels) =>
  Object.entries(labels)
    .map(([key, value]) => `${key}="${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`)
    .join(',');

const renderCounter = () => [
  '# HELP http_requests_total Total HTTP requests.',
  '# TYPE http_requests_total counter',
  ...[...httpRequests.values()].map(({ labels, value }) =>
    `http_requests_total{${formatLabels(labels)}} ${value}`
  ),
];

const renderDurationHistogram = () => {
  const rows = [...httpDurations.values()];
  const buckets = rows
    .filter(({ labels }) => !['sum', 'count'].includes(labels.le))
    .map(({ labels, value }) => `http_request_duration_seconds_bucket{${formatLabels(labels)}} ${value}`);
  const sums = rows
    .filter(({ labels }) => labels.le === 'sum')
    .map(({ labels, value }) => {
      const { le, ...rest } = labels;
      return `http_request_duration_seconds_sum{${formatLabels(rest)}} ${value}`;
    });
  const counts = rows
    .filter(({ labels }) => labels.le === 'count')
    .map(({ labels, value }) => {
      const { le, ...rest } = labels;
      return `http_request_duration_seconds_count{${formatLabels(rest)}} ${value}`;
    });

  return [
    '# HELP http_request_duration_seconds HTTP request duration in seconds.',
    '# TYPE http_request_duration_seconds histogram',
    ...buckets,
    ...sums,
    ...counts,
  ];
};

const renderMetrics = () => [
  ...renderCounter(),
  ...renderDurationHistogram(),
  '',
].join('\n');

const resetMetrics = () => {
  httpRequests.clear();
  httpDurations.clear();
};

module.exports = {
  recordHttpRequest,
  renderMetrics,
  resetMetrics,
};
