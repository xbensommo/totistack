/**
 * Generates feature metadata files.
 */
export class FeatureGenerator {
  /**
   * @param {any} feature
   * @returns {Array<{path: string, content: string}>}
   */
  generate(feature) {
    return [
      {
        path: `src/features/${feature.id}/feature.json`,
        content: JSON.stringify(feature, null, 2),
      },
    ];
  }
}
