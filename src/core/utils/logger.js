/**
 * @file logger.js
 * @description Simple logging utility with levels.
 * @date 2026-03-22
 * @author Totistack Team
 */

import chalk from 'chalk';

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel = process.env.TOTISTACK_LOG_LEVEL || 'info';

export function setLogLevel(level) {
  if (levels[level] !== undefined) currentLevel = level;
}

// 1. Export individual functions (Satisfies: import * as logger from '...')
export function debug(message, ...args) {
  if (levels.debug >= levels[currentLevel]) {
    console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
  }
}

export function info(message, ...args) {
  if (levels.info >= levels[currentLevel]) {
    console.log(chalk.blue(`[INFO] ${message}`), ...args);
  }
}

export function warn(message, ...args) {
  if (levels.warn >= levels[currentLevel]) {
    console.log(chalk.yellow(`[WARN] ${message}`), ...args);
  }
}

export function error(message, ...args) {
  if (levels.error >= levels[currentLevel]) {
    console.error(chalk.red(`[ERROR] ${message}`), ...args);
  }
}

// 2. Export named object (Satisfies: import { logger } from '...')
export const logger = { debug, info, warn, error };

// 3. Export default object (Satisfies: import logger from '...')
export default logger;