/**
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
 *
 * Preset contract reference
 *
 * {
 *   name: string,
 *   title: string,
 *   description: string,
 *   features: string[],
 *   options?: object
 * }
 */
export {};