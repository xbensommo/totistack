#!/usr/bin/env node

import { runCLI } from '../src/cli/index.js';

runCLI().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});