/**
 * @file config-validator.js
 * @description Validates project config.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { validateProjectConfig } from '../contracts/project-config.contract.js';

export function validateConfig(config) {
  validateProjectConfig(config);
  return true;
}