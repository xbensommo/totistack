import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';

const PAGE_SIZE = 500;

/**
 * DatabaseManagerService
 *
 * Provides server-side / service-layer operations for the database-manager module.
 * All public methods are async and return structured result objects.
 * Errors propagate raw so callers (hooks / store) can apply getFriendlyMessage.
 */
export default class DatabaseManagerService {
  /**
   * @param {object} config
   * @param {import('firebase/app').FirebaseApp} [config.app] - optional Firebase app instance
   */
  constructor(config = {}) {
    this._config = config;
    this._db = getFirestore(config.app ?? undefined);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Paginated full-read of a Firestore collection.
   * Returns all documents as plain JS objects with `_id` injected.
   * @param {string} collectionPath
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async _readAllDocs(collectionPath) {
    const results = [];
    let lastDoc = null;

    while (true) {
      let q = query(
        collection(this._db, collectionPath),
        orderBy('__name__'),
        limit(PAGE_SIZE)
      );
      if (lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      if (snap.empty) break;

      snap.docs.forEach((d) => results.push({ _id: d.id, ...d.data() }));
      lastDoc = snap.docs[snap.docs.length - 1];

      if (snap.docs.length < PAGE_SIZE) break;
    }

    return results;
  }

  /**
   * Write documents into a destination collection in batched writes.
   * @param {string} destPath
   * @param {Array<Record<string, unknown>>} docs
   */
  async _batchWrite(destPath, docs) {
    const CHUNK = 400;
    for (let i = 0; i < docs.length; i += CHUNK) {
      const batch = writeBatch(this._db);
      docs.slice(i, i + CHUNK).forEach(({ _id, ...data }) => {
        const ref = _id
          ? doc(this._db, destPath, _id)
          : doc(collection(this._db, destPath));
        batch.set(ref, data);
      });
      await batch.commit();
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Backup all documents from `sourceCollection` into `backupCollection`.
   * Creates a metadata doc in `_admin_logs` after a successful backup.
   *
   * @param {string} sourceCollection  - e.g. "users"
   * @param {string} [backupCollection] - defaults to `<source>__backup__<timestamp>`
   * @returns {Promise<{ source: string, destination: string, docCount: number, timestamp: Date }>}
   */
  async backupCollection(sourceCollection, backupCollection) {
    if (!sourceCollection) throw new Error('sourceCollection is required');

    const timestamp = new Date();
    const dest =
      backupCollection ??
      `${sourceCollection}__backup__${timestamp.toISOString().replace(/[:.]/g, '-')}`;

    const docs = await this._readAllDocs(sourceCollection);
    await this._batchWrite(dest, docs);

    // Audit log
    const logRef = doc(collection(this._db, '_admin_logs'));
    const singleBatch = writeBatch(this._db);
    singleBatch.set(logRef, {
      action: 'backup',
      source: sourceCollection,
      destination: dest,
      docCount: docs.length,
      createdAt: serverTimestamp()
    });
    await singleBatch.commit();

    return { source: sourceCollection, destination: dest, docCount: docs.length, timestamp };
  }

  /**
   * Run a migration by applying a transform function to every document
   * in `sourceCollection` and writing results to `targetCollection`.
   * Records seed entry in `_seed_records` after completion.
   *
   * @param {string} sourceCollection
   * @param {string} targetCollection
   * @param {(doc: Record<string, unknown>) => Record<string, unknown>} transformFn
   *   Pure function: receives a plain doc object, returns the transformed version.
   * @returns {Promise<{ source: string, target: string, transformed: number, errors: number, timestamp: Date }>}
   */
  async runMigration(sourceCollection, targetCollection, transformFn) {
    if (!sourceCollection) throw new Error('sourceCollection is required');
    if (!targetCollection) throw new Error('targetCollection is required');
    if (typeof transformFn !== 'function') throw new Error('transformFn must be a function');

    const sourceDocs = await this._readAllDocs(sourceCollection);
    const transformed = [];
    const errorLog = [];

    for (const docData of sourceDocs) {
      try {
        const result = await transformFn(docData);
        if (result && typeof result === 'object') {
          transformed.push({ _id: docData._id, ...result });
        }
      } catch (err) {
        errorLog.push({ _id: docData._id, reason: err.message });
      }
    }

    if (transformed.length > 0) {
      await this._batchWrite(targetCollection, transformed);
    }

    // Seed record
    const seedRef = doc(collection(this._db, '_seed_records'));
    const seedBatch = writeBatch(this._db);
    seedBatch.set(seedRef, {
      type: 'migration',
      source: sourceCollection,
      target: targetCollection,
      transformed: transformed.length,
      errors: errorLog.length,
      errorDetails: errorLog.slice(0, 50), // cap stored errors
      createdAt: serverTimestamp()
    });
    await seedBatch.commit();

    return {
      source: sourceCollection,
      target: targetCollection,
      transformed: transformed.length,
      errors: errorLog.length,
      timestamp: new Date()
    };
  }

  /**
   * Derive the schema of a collection by sampling up to `sampleSize` documents
   * and merging their top-level field names + inferred types.
   *
   * @param {string} collectionPath
   * @param {number} [sampleSize=50]
   * @returns {Promise<Record<string, { types: string[], count: number }>>}
   */
  async inferSchema(collectionPath, sampleSize = 50) {
    if (!collectionPath) throw new Error('collectionPath is required');

    const q = query(collection(this._db, collectionPath), limit(sampleSize));
    const snap = await getDocs(q);
    const schema = {};

    snap.docs.forEach((d) => {
      const data = d.data();
      for (const [key, value] of Object.entries(data)) {
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
        if (!schema[key]) schema[key] = { types: new Set(), count: 0 };
        schema[key].types.add(type);
        schema[key].count += 1;
      }
    });

    // Serialize Sets for JSON-safe transport
    return Object.fromEntries(
      Object.entries(schema).map(([k, v]) => [k, { types: [...v.types], count: v.count }])
    );
  }
}
