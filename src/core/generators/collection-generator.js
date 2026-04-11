import { validateCollection } from '../validators/collection-validator.js';
import { CrudGenerator } from './crud-generator.js';
import { RouteGenerator } from './route-generator.js';
import { StoreGenerator } from './store-generator.js';

/**
 * Generates collection artifacts.
 */
export class CollectionGenerator {
  constructor(options = {}) {
    this.crudGenerator = options.crudGenerator || new CrudGenerator();
    this.routeGenerator = options.routeGenerator || new RouteGenerator();
    this.storeGenerator = options.storeGenerator || new StoreGenerator();
  }

  /**
   * @param {object} value
   * @returns {Array<{path: string, content: string}>}
   */
  generate(value) {
    const collection = validateCollection(value);
    return [
      ...this.crudGenerator.generate(collection),
      ...this.routeGenerator.generate(collection),
      ...this.storeGenerator.generate(collection),
    ];
  }
}
