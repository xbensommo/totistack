import { ValidationError } from '../errors/ValidationError.js';

/**
 * Shared entity contract helpers.
 */
export class BaseContract {
  /**
   * @param {object} input
   */
  constructor(input = {}) {
    Object.assign(this, input);
    Object.freeze(this);
  }

  /**
   * @param {string} field
   * @param {unknown} value
   * @returns {string}
   */
  static requireNonEmptyString(field, value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ValidationError(`${field} must be a non-empty string`, { field, value });
    }
    return value.trim();
  }

  /**
   * @param {string} field
   * @param {unknown} value
   * @returns {string[]}
   */
  static normalizeStringArray(field, value) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
      throw new ValidationError(`${field} must be an array`, { field, value });
    }
    return value.map((item) => this.requireNonEmptyString(`${field}[]`, item));
  }
}
