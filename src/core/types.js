/**
 * Prompt shape
 *
 * {
 *   name: string,
 *   type: 'input' | 'list' | 'checkbox' | 'confirm',
 *   message: string,
 *   choices?: Array<{ name: string, value: any }> | string[],
 *   default?: any,
 *   when?: (answers, ctx) => boolean
 * }
 *
 * Feature contract reference
 *
 * {
 *   name: string,
 *   title: string,
 *   description: string,
 *   category?: string,
 *   dependencies?: string[],
 *   optionalDependencies?: string[],
 *   incompatibleWith?: string[],
 *   prompts?: Array<Prompt>,
 *   install: async (ctx) => void,
 *   doctor?: async (ctx) => Array<string>
 * }
 */
export {};