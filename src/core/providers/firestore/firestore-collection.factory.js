/**
 * Creates normalized collection accessors from collection contracts.
 */
export class FirestoreCollectionFactory {
  /**
   * @param {import('./shard-provider.adapter.js').ShardProviderAdapter} adapter
   */
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * @param {any} collection
   * @returns {object}
   */
  create(collection) {
    return this.adapter.createActions(collection.id, {
      fields: collection.fields,
      indexes: collection.indexes,
      relations: collection.relations,
    });
  }
}
