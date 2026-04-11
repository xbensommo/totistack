/**
 * @file Small argument parsing helpers for the Totistack CLI.
 */

/**
 * @typedef {Object} ParsedArgv
 * @property {string[]} positionals
 * @property {Record<string, unknown>} flags
 */

/**
 * Parses a raw argv array into positionals and flags.
 * Supports:
 * - --key value
 * - --key=value
 * - --no-key
 * - -v / -f auth,rbac
 *
 * @param {string[]} argv
 * @returns {ParsedArgv}
 */
export function parseArgv(argv = []) {
  /** @type {string[]} */
  const positionals = [];
  /** @type {Record<string, unknown>} */
  const flags = {};

  const aliasMap = {
    f: 'features',
    a: 'apps',
    p: 'presets',
    y: 'yes',
    h: 'help',
    v: 'verbose'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('-') || token === '-') {
      positionals.push(token);
      continue;
    }

    if (token.startsWith('--no-')) {
      flags[token.slice(5)] = false;
      continue;
    }

    if (token.startsWith('--')) {
      const trimmed = token.slice(2);

      if (trimmed.includes('=')) {
        const [rawKey, ...rawValue] = trimmed.split('=');
        flags[rawKey] = rawValue.join('=');
        continue;
      }

      const next = argv[index + 1];
      if (next && !next.startsWith('-')) {
        flags[trimmed] = next;
        index += 1;
      } else {
        flags[trimmed] = true;
      }

      continue;
    }

    const shortFlags = token.slice(1).split('');
    for (let shortIndex = 0; shortIndex < shortFlags.length; shortIndex += 1) {
      const shortFlag = shortFlags[shortIndex];
      const key = aliasMap[shortFlag] || shortFlag;
      const isLast = shortIndex === shortFlags.length - 1;
      const next = argv[index + 1];

      if (isLast && next && !next.startsWith('-')) {
        flags[key] = next;
        index += 1;
      } else {
        flags[key] = true;
      }
    }
  }

  return { positionals, flags };
}

/**
 * Converts a flag value into a normalized boolean.
 *
 * @param {unknown} value
 * @param {boolean} [defaultValue=false]
 * @returns {boolean}
 */
export function asBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

/**
 * Converts a scalar or CSV flag into a unique string array.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function asList(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  const items = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}
