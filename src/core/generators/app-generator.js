import { pascalCase, camelCase } from '../utils/naming.js';

/**
 * Generates app integration stubs into scaffold output.
 */
export class AppGenerator {
  /**
   * @param {any} app
   * @returns {Array<{path: string, content: string}>}
   */
  generate(app) {
    const componentName = `${pascalCase(app.id)}App`;
    const variableName = camelCase(app.id);

    return [
      {
        path: `src/apps/${app.id}/index.js`,
        content: `export const ${variableName} = ${JSON.stringify(app, null, 2)};`,
      },
      {
        path: `src/apps/${app.id}/${componentName}.vue`,
        content: `<template><section>${app.name}</section></template>`,
      },
    ];
  }
}
