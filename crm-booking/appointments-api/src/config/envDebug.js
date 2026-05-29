const SECRET_KEY_PATTERN = /(SECRET|TOKEN|PASSWORD|PASS|KEY|URI|URL|DSN|DATABASE|MONGO|POSTGRES)/i;

const isEnvDebugEnabled = () =>
  String(process.env.DEBUG_ENV || '').toLowerCase() === 'true';

const maskValue = (key, value) => {
  if (value === undefined) return undefined;
  const text = String(value);

  if (!SECRET_KEY_PATTERN.test(key)) {
    return text;
  }

  if (!text) return '';
  if (text.length <= 8) return '***';

  return `${text.slice(0, 4)}...${text.slice(-4)}`;
};

const getMaskedEnv = () =>
  Object.fromEntries(
    Object.keys(process.env)
      .sort()
      .map((key) => [key, maskValue(key, process.env[key])])
  );

module.exports = {
  getMaskedEnv,
  isEnvDebugEnabled,
  maskValue,
};
