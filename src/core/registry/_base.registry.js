import { ValidationError } from '../errors/ValidationError.js';

/**
 * Generic in-memory registry.
 */
export class BaseRegistry {
  /**
   * @param {string} name
   * @param {(value: any) => any} [normalize]
   */
  constructor(name, normalize = (value) => value) {
    this.name = name;
    this.normalize = normalize;
    this.items = new Map();
  }

  /**
   * @param {any} item
   * @returns {any}
   */
  register(item) {
    const normalized = this.normalize(item);
    if (!normalized?.id) {
      throw new ValidationError(`${this.name} registry item must have an id`, { item: normalized });
    }
    this.items.set(normalized.id, normalized);
    return normalized;
  }

  /**
   * @param {any[]} items
   * @returns {any[]}
   */
  registerMany(items = []) {
    return items.map((item) => this.register(item));
  }

  /**
   * @param {string} id
   * @returns {any | null}
   */
  get(id) {
    return this.items.get(id) || null;
  }

  /**
   * @returns {any[]}
   */
  list() {
    return Array.from(this.items.values());
  }

  /**
   * @param {(item: any) => boolean} predicate
   * @returns {any[]}
   */
  filter(predicate) {
    return this.list().filter(predicate);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this.items.has(id);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    return this.items.delete(id);
  }

  clear() {
    this.items.clear();
  }
}
