<!--
  @file PROJECT-ARCHITECTURE.md
  @description Detailed architecture documentation for the generated project
  @date 2026-03-22
  @author Totistack Team
-->

# Project Architecture: {{appName}}

## 🏗️ Overview

This document describes the architectural decisions, patterns, and structure of the {{appName}} application. The application follows a modular, feature-based architecture that promotes separation of concerns, reusability, and maintainability.

## 🎯 Architecture Principles

1. **Modularity**: Each business capability is encapsulated in its own module
2. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
3. **Dependency Injection**: Services and providers are injected rather than imported directly
4. **Composition over Inheritance**: Vue 3 Composition API for reusable logic
5. **Type Safety**: JSDoc and TypeScript-ready code
6. **Testability**: Components designed for easy unit and integration testing

## 📦 Module Architecture

### App Module Structure

Each app module follows this structure:

```
modules/{{appName}}/
├── index.js                 # Module entry point
├── manifest.js              # Module metadata
├── routes.js                # Route definitions
├── navigation.js            # Navigation configuration
├── stores/                  # Pinia stores
│   └── index.js
├── pages/                   # Page components
│   ├── ListPage.vue
│   ├── CreatePage.vue
│   ├── EditPage.vue
│   └── DetailsPage.vue
├── components/              # Reusable components
├── services/                # Business logic
│   └── index.js
├── collections/             # Collection definitions
│   └── {{collection}}/
│       ├── definition.js
│       ├── service.js
│       ├── store.js
│       ├── routes.js
│       ├── pages/
│       └── components/
└── hooks/                   # Vue composables
```

### Feature Module Structure

Feature modules are smaller, reusable capabilities:

```
features/{{featureName}}/
├── index.js                 # Feature entry point
├── manifest.js              # Feature metadata
├── routes.js                # Routes (if any)
├── store.js                 # Pinia store
├── services/                # Feature services
├── components/              # Feature components
└── guards/                  # Route guards
```

## 🔄 Data Flow

### State Management

The application uses **Pinia** for state management with a unidirectional data flow:

```
User Action → Component → Store Action → Service → API/Provider → Store Update → Component Re-render
```

### Store Pattern

```javascript
// Store structure
const useStore = defineStore('module', () => {
  // State
  const items = ref([]);
  const loading = ref(false);
  
  // Getters
  const hasItems = computed(() => items.value.length > 0);
  
  // Actions
  async function fetchItems() {
    loading.value = true;
    try {
      items.value = await service.getAll();
    } finally {
      loading.value = false;
    }
  }
  
  return { items, loading, hasItems, fetchItems };
});
```

### Service Layer

Services encapsulate business logic and data operations:

```javascript
class EntityService {
  async getAll() {
    // Provider interaction
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async create(data) {
    // Validation, hooks, etc.
    return await this.collection.add(data);
  }
}
```

## 🗄️ Database Architecture

### Firestore Collections

The application uses Firestore with the **Shard Provider** pattern for scalability:

```
/users/                 # User profiles
  {userId}/
    profile/           # User profile data
    preferences/       # User preferences
    activity/          # Activity logs

/modules/              # Module-specific data
  {moduleId}/
    {collection}/
      {documentId}/
```

### Collection Definition

Each collection is defined with:

```javascript
export default {
  name: 'collectionName',
  provider: 'firestore',
  adapter: 'shard-provider',
  fields: { /* schema */ },
  indexes: [ /* query indexes */ ],
  hooks: { /* lifecycle hooks */ }
};
```

## 🔌 Provider System

### Provider Registration

Providers are registered in `src/app/providers/`:

```javascript
// src/app/providers/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseApp = initializeApp(config);
export const firestore = getFirestore(firebaseApp);
```

### Shard Provider Pattern

The Shard Provider handles Firestore scalability:

```javascript
import { createShardProvider } from '@xbensommo/shard-provider';

const shardProvider = createShardProvider(firestore, {
  shardCount: 10,
  collectionPrefix: 'app_'
});
```

## 🎨 UI Architecture

### Component Hierarchy

```
AppShell
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   └── Navigation Items
├── Main
│   └── RouterView
│       └── Page Components
│           └── Feature Components
└── Footer
```

### Styling System

The application uses **Tailwind CSS** with a custom theme:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)'
      }
    }
  }
};
```

### Theme Variables

CSS custom properties define the theme:

```css
:root {
  --color-primary: #2e5b28;
  --color-secondary: #2b75bc;
  --font-sans: 'Inter', sans-serif;
}
```

## 🔐 Security Architecture

### Authentication Flow

```
User → Login Component → Auth Service → Firebase Auth → JWT Token → API Requests
```

### Authorization

Role-based access control (RBAC):

```javascript
// Permission guard
router.beforeEach((to, from, next) => {
  if (to.meta.permissions) {
    const hasPermission = checkPermissions(to.meta.permissions);
    if (!hasPermission) next('/unauthorized');
  }
  next();
});
```

### Firestore Security Rules

Rules are defined in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 🚀 Performance Optimizations

### Code Splitting

- Route-based code splitting via dynamic imports
- Vendor chunk splitting in Vite config
- Lazy loading of modules

### Caching Strategy

- Service Worker for offline support
- Firestore persistence enabled
- API response caching with Pinia

### Image Optimization

- Lazy loading for images
- Responsive images with srcset
- WebP format with fallbacks

## 🧪 Testing Strategy

### Unit Tests

- Components tested with Vue Test Utils
- Stores tested with Pinia testing utilities
- Services tested with mocked providers

### Integration Tests

- API integration testing
- Database integration tests
- End-to-end testing with Cypress

## 📦 Deployment Architecture

### Build Pipeline

```
Source → Vite Build → Optimized Assets → Firebase Hosting / CDN
```

### Environment Configuration

```javascript
// .env.production
VITE_API_URL=https://api.{{projectName}}.com
VITE_FIREBASE_PROJECT_ID={{projectId}}
```

### CI/CD Flow

1. Push to repository
2. Run tests
3. Build application
4. Deploy to staging
5. Run smoke tests
6. Deploy to production

## 🔄 Module Communication

### Event Bus

Modules communicate via a centralized event bus:

```javascript
import { useEventBus } from '@/core/composables/useEventBus';

const bus = useEventBus();
bus.emit('entity:created', { id: '123' });
bus.on('entity:created', handleCreate);
```

### Shared State

Shared state is managed in the `shared/` directory:

```javascript
// shared/state/useAppState.js
export const useAppState = () => {
  const globalLoading = ref(false);
  // Shared state logic
};
```

## 📊 Monitoring & Logging

### Error Tracking

- Global error handler in Vue
- Sentry integration (if configured)
- Console logging in development

### Performance Monitoring

- Vue Devtools for development
- Firebase Performance Monitoring
- Custom performance markers

## 🏛️ Design Patterns Used

1. **Singleton**: Services and providers
2. **Factory**: Collection and provider creation
3. **Observer**: Event system and store subscriptions
4. **Decorator**: Route guards and permission checks
5. **Strategy**: Different providers for different environments
6. **Repository**: Data access abstraction through services

## 🔮 Future Considerations

1. **Micro-frontend Architecture**: Potential to split modules into separate builds
2. **GraphQL Integration**: Alternative to REST/ Firestore
3. **Server-Side Rendering**: Vue SSR with Nuxt
4. **Mobile App**: Native wrapper with Capacitor
5. **Real-time Features**: Enhanced WebSocket integration

---

**Last Updated**: {{currentDate}}
**Architecture Version**: 1.0.0
**Maintainers**: {{teamMembers}}