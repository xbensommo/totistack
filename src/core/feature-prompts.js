import inquirer from 'inquirer';
import { getFeature } from './registry.js';

export async function collectFeatureAnswers(featureNames, { existingAnswers = {} } = {}) {
  const allAnswers = structuredClone(existingAnswers);

  for (const featureName of featureNames) {
    const feature = await getFeature(featureName);
    if (!feature) {
      throw new Error(`Unknown feature: "${featureName}"`);
    }

    const prompts = Array.isArray(feature.prompts) ? feature.prompts : [];
    if (!prompts.length) continue;

    const unansweredPrompts = prompts.filter((prompt) => {
      return !(prompt.name in (allAnswers[featureName] || {}));
    });

    if (!unansweredPrompts.length) continue;

    const featureAnswers = await inquirer.prompt(
      unansweredPrompts.map((prompt) => ({
        ...prompt,
        when: prompt.when
          ? (answers) => prompt.when(answers, { featureName, allAnswers })
          : undefined,
      }))
    );

    allAnswers[featureName] = {
      ...(allAnswers[featureName] || {}),
      ...featureAnswers,
    };
  }

  return allAnswers;
}