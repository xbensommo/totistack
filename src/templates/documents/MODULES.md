<!--
  @file MODULES.md
  @description Comprehensive documentation of all installed modules
  @date 2026-03-22
  @author Totistack Team
-->

# Module Documentation: {{appName}}

## 📦 Module Overview

This document provides detailed documentation for all installed modules in the {{appName}} application. Each module is a self-contained business capability with its own UI, logic, and data structures.

## 🧩 Apps

{{#each apps}}

### {{this.name}} ({{this.id}})

{{this.description}}

**Version**: {{this.version}}  
**Author**: {{this.author}}  
**Dependencies**: {{this.dependencies}}

#### Features

{{#each this.features}}
- **{{this.name}}**: {{this.description}}
{{/each}}

#### Collections

{{#each this.collections}}
- **{{this.name}}**: {{this.description}}
  - Fields: {{this.fields}}
  - Permissions: {{this.permissions}}
{{/each}}

#### Routes

{{#each this.routes}}
- `{{this.path}}` → {{this.component}}
  - Requires Auth: {{this.requiresAuth}}
  - Permissions: {{this.permissions}}
{{/each}}

#### Configuration Options

```javascript
// src/config/apps.config.js
{
  "{{this.id}}": {
    "enabled": true,
    "navVisible": true,
    "order": {{@index}},
    "options": {
      // Module-specific options
      {{#each this.options}}
      "{{this.key}}": "{{this.value}}",
      {{/each}}
    }
  }
}
```

#### Events

{{#each this.events}}
- **{{this.name}}**: {{this.description}}
  - Payload: `{{this.payload}}`
{{/each}}

#### Hooks

{{#each this.hooks}}
- **{{this.name}}**: {{this.description}}
  - Parameters: `{{this.params}}`
  - Returns: `{{this.returns}}`
{{/each}}

#### API Reference

##### Services

{{#each this.services}}
- **{{this.name}}**: {{this.description}}
  - Methods:
    {{#each this.methods}}
    - `{{this.signature}}` → {{this.returns}}
    {{/each}}
{{/each}}

##### Stores

{{#each this.stores}}
- **{{this.name}}**: {{this.description}}
  - State:
    {{#each this.state}}
    - `{{this.name}}`: {{this.type}}
    {{/each}}
  - Getters:
    {{#each this.getters}}
    - `{{this.name}}`: {{this.description}}
    {{/each}}
  - Actions:
    {{#each this.actions}}
    - `{{this.name}}({{this.params}})` → {{this.returns}}
    {{/each}}
{{/each}}

##### Components

{{#each this.components}}
- **{{this.name}}**: {{this.description}}
  - Props:
    {{#each this.props}}
    - `{{this.name}}` ({{this.type}}): {{this.description}}
    {{/each}}
  - Events:
    {{#each this.events}}
    - `{{this.name}}` → {{this.payload}}
    {{/each}}
{{/each}}

#### Usage Examples

```vue
<template>
  <div>
    <!-- Import module components -->
    <{{this.id}}-component />
  </div>
</template>

<script setup>
import { use{{this.pascalName}}Store } from '@/modules/{{this.id}}/stores';
import { {{this.camelName}}Service } from '@/modules/{{this.id}}/services';

// Use store
const store = use{{this.pascalName}}Store();
await store.fetchItems();

// Use service
const data = await {{this.camelName}}Service.getAll();
</script>
```

#### Customization

To customize this module:

1. **Override components**: Create a component with the same name in `src/modules/{{this.id}}/components/overrides/`
2. **Extend services**: Create a new service that extends the base service
3. **Modify routes**: Edit `src/modules/{{this.id}}/routes.js`
4. **Customize styling**: Override CSS classes or use the `:deep()` selector

---

{{/each}}

## ⚙️ Features

{{#each features}}

### {{this.name}} ({{this.id}})

{{this.description}}

**Version**: {{this.version}}  
**Author**: {{this.author}}  
**Dependencies**: {{this.dependencies}}

#### Configuration

```javascript
// src/config/features.config.js
{
  "{{this.id}}": {
    "enabled": true,
    "options": {
      {{#each this.options}}
      "{{this.key}}": "{{this.value}}",
      {{/each}}
    }
  }
}
```

#### API

{{#each this.apis}}
- **{{this.name}}**: {{this.description}}
  - Usage: `{{this.usage}}`
{{/each}}

#### Integration

To use this feature in a custom module:

```javascript
import { use{{this.pascalName}} } from '@/features/{{this.id}}';

const {{this.camelName}} = use{{this.pascalName}}();
// Use the feature
```

---

{{/each}}

## 📊 Module Dependencies

### Dependency Graph

```
{{dependencyGraph}}
```

### Circular Dependencies

{{#if circularDependencies}}
⚠️ **Warning**: Circular dependencies detected:
{{#each circularDependencies}}
- {{this}}
{{/each}}
{{else}}
✅ No circular dependencies found.
{{/if}}

## 🔧 Module Development

### Creating a New App

1. Create directory: `src/modules/my-app/`
2. Add `manifest.js` with module metadata
3. Implement required files (routes, stores, services)
4. Add `index.js` as entry point
5. Register in `apps.config.js`

### Creating a New Feature

1. Create directory: `src/features/my-feature/`
2. Add `manifest.js` with feature metadata
3. Implement feature logic
4. Export API in `index.js`
5. Register in `features.config.js`

### Testing Modules

```bash
# Test specific module
npm run test:module -- --module={{appId}}

# Test all modules
npm run test:modules

# Run with coverage
npm run test:modules -- --coverage
```

### Module Lifecycle

```javascript
// Module lifecycle hooks
export default {
  id: 'my-module',
  
  // Called when module is installed
  async install(app) {
    // Setup logic
  },
  
  // Called when module is initialized
  async init(app, config) {
    // Initialization logic
  },
  
  // Called when module is destroyed
  async destroy() {
    // Cleanup logic
  }
};
```

## 📈 Module Performance

### Bundle Size Analysis

{{#each apps}}
- **{{this.name}}**: {{this.bundleSize}} (gzipped)
  - Largest chunks:
    {{#each this.chunks}}
    - {{this.name}}: {{this.size}}
    {{/each}}
{{/each}}

### Load Times

{{#each apps}}
- **{{this.name}}**: {{this.loadTime}}ms (initial), {{this.navigationTime}}ms (navigation)
{{/each}}

## 🔐 Module Permissions

### Required Permissions

{{#each apps}}
**{{this.name}}**:
{{#each this.permissions}}
- `{{this}}`: {{getPermissionDescription this}}
{{/each}}
{{/each}}

### Permission Mapping

```javascript
// Permission to role mapping
const permissionMap = {
  {{#each permissions}}
  '{{this.name}}': ['{{this.roles}}'],
  {{/each}}
};
```

## 🐛 Known Issues

{{#each issues}}
- **[{{this.severity}}]** {{this.description}}
  - Affects: {{this.modules}}
  - Workaround: {{this.workaround}}
  - Fixed in: {{this.fixedIn}}
{{/each}}

## 📝 Module Changelog

{{#each changelogs}}
### {{this.module}} - {{this.version}}

{{#each this.changes}}
- {{this}}
{{/each}}

{{/each}}

---

**Documentation Version**: 1.0.0  
**Last Updated**: {{currentDate}}  
**Maintainer**: {{maintainer}}