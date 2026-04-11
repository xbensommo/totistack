/**
 * @file collection-installer.js
 * @description Scaffolds a collection inside an app or feature.
 * @date 2026-03-22
 * @author Totistack Team
 */

import path from 'path';
import { writeFile, ensureFile } from '../utils/file.js';
import { getTemplatesDir } from '../utils/path.js';
import { toPascalCase, toKebabCase, pluralize } from '../utils/text.js';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Generate CRUD files for a collection within an app.
 * @param {string} collectionName - Collection name (plural).
 * @param {string} appId - App ID.
 * @param {string} projectRoot - Project root.
 * @returns {Promise<void>}
 */
export async function installCollection(collectionName, appId, projectRoot) {
  try {
    const collectionPath = path.join(projectRoot, 'src', 'modules', appId, 'collections', collectionName);
    const singular = pluralize(collectionName).replace(/s$/, ''); // simple singular
    const componentName = toPascalCase(singular);
    const kebabName = toKebabCase(collectionName);

    // Create directory structure
    await ensureFile(path.join(collectionPath, 'definition.js'));
    await ensureFile(path.join(collectionPath, 'service.js'));
    await ensureFile(path.join(collectionPath, 'store.js'));
    await ensureFile(path.join(collectionPath, 'routes.js'));
    await ensureFile(path.join(collectionPath, 'pages', `${componentName}ListPage.vue`));
    await ensureFile(path.join(collectionPath, 'pages', `${componentName}CreatePage.vue`));
    await ensureFile(path.join(collectionPath, 'pages', `${componentName}EditPage.vue`));
    await ensureFile(path.join(collectionPath, 'pages', `${componentName}DetailsPage.vue`));
    await ensureFile(path.join(collectionPath, 'components', `${componentName}Form.vue`));

    // Write placeholder content
    await writeFile(path.join(collectionPath, 'definition.js'), `export default { name: '${collectionName}' };\n`);
    await writeFile(path.join(collectionPath, 'service.js'), `// Service for ${collectionName}\n`);
    await writeFile(path.join(collectionPath, 'store.js'), `// Pinia store for ${collectionName}\n`);
    await writeFile(path.join(collectionPath, 'routes.js'), `export default [ { path: '/${kebabName}', component: () => import('./pages/${componentName}ListPage.vue') } ];\n`);
    await writeFile(path.join(collectionPath, 'pages', `${componentName}ListPage.vue`), `<template><div>${componentName} List</div></template>`);
    await writeFile(path.join(collectionPath, 'pages', `${componentName}CreatePage.vue`), `<template><div>Create ${componentName}</div></template>`);
    await writeFile(path.join(collectionPath, 'pages', `${componentName}EditPage.vue`), `<template><div>Edit ${componentName}</div></template>`);
    await writeFile(path.join(collectionPath, 'pages', `${componentName}DetailsPage.vue`), `<template><div>${componentName} Details</div></template>`);
    await writeFile(path.join(collectionPath, 'components', `${componentName}Form.vue`), `<template><form><div>${componentName} Form</div></form></template>`);

    logger.info(`Installed collection ${collectionName} in app ${appId}`);
  } catch (err) {
    throw new InstallError(`Failed to install collection ${collectionName}: ${err.message}`, { cause: err });
  }
}