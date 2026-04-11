<!--
  @file README.generated.md
  @description Main README documentation for the generated project
  @date 2026-03-22
  @author Totistack Team
-->

# {{appName}} v{{projectVersion}}

> Generated with Totistack v2.0.0 - A modular business application framework

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Vue Version](https://img.shields.io/badge/vue-3.4.0-brightgreen)](https://vuejs.org)

## 📋 Overview

{{appDescription}}

This project was automatically generated using Totistack, a modular framework for building business applications. It comes pre-configured with:

- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Pinia** for state management
- **Vue Router** for navigation
- **Firebase/Firestore** integration
- **Tailwind CSS** for styling
- **ESLint & Prettier** for code quality

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- Firebase account (if using Firestore)

### Installation

```bash
# Clone the repository (if not already in project directory)
cd {{projectName}}

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 📁 Project Structure

```
{{projectName}}/
├── public/                 # Static assets
├── src/
│   ├── app/               # Application bootstrap
│   │   ├── main.js        # Entry point
│   │   ├── App.vue        # Root component
│   │   ├── router/        # Route configuration
│   │   ├── stores/        # Global stores
│   │   ├── providers/     # Service providers
│   │   ├── plugins/       # Vue plugins
│   │   ├── shell/         # App shell components
│   │   └── boot/          # Boot sequence
│   ├── config/            # Project configuration
│   │   ├── project.config.js
│   │   ├── branding.config.js
│   │   ├── apps.config.js
│   │   ├── features.config.js
│   │   └── collections.config.js
│   ├── core/              # Core utilities
│   ├── modules/           # Installed business apps
│   │   {{#each apps}}
│   │   ├── {{this}}/      # {{this}} module
│   │   {{/each}}
│   ├── features/          # Installed features
│   │   {{#each features}}
│   │   ├── {{this}}/      # {{this}} feature
│   │   {{/each}}
│   ├── shared/            # Shared components & utilities
│   └── assets/            # CSS, images, fonts
├── .env                   # Environment variables
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind configuration
```

## 🧩 Installed Modules

### Apps

{{#each apps}}
- **{{this}}** - {{getAppDescription this}}
{{/each}}

### Features

{{#each features}}
- **{{this}}** - {{getFeatureDescription this}}
{{/each}}

## 🔧 Configuration

### Project Configuration (`src/config/project.config.js`)

Main project settings including API endpoints, environment variables, and module configuration.

### Branding Configuration (`src/config/branding.config.js`)

Theme colors, typography, and brand identity settings.

### Module Configuration

Each app and feature can be configured individually through their respective configuration files.

## 🗄️ Database Collections

{{#each collections}}
### {{this.name}}
- **Collection Path**: `{{this.path}}`
- **Fields**: {{this.fields}}
- **Permissions**: {{this.permissions}}
{{/each}}

## 🔐 Authentication & Authorization

The project uses Firebase Authentication with role-based access control (RBAC). Default roles include:

- **Admin**: Full system access
- **Manager**: Department-level access
- **User**: Standard user access
- **Guest**: Limited read-only access

## 🚦 Development Workflow

### Code Style

This project uses ESLint and Prettier for consistent code formatting.

```bash
# Lint and fix
npm run lint

# Format code
npm run format
```

### Git Workflow

We recommend following this branch strategy:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `release/*` - Release preparation

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Testing
- `chore:` Maintenance

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Custom Server

Build the project and serve the `dist` directory with any static file server.

## 🐛 Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check your `.env` file for correct Firebase credentials
   - Ensure Firebase project is properly configured

2. **Module not found errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check import paths in the code

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Update Node.js to the latest LTS version

## 📚 Additional Resources

- [Totistack Documentation](https://docs.totistack.dev)
- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For questions and support:
- GitHub Issues: [{{githubRepo}}/issues]({{githubRepo}}/issues)
- Documentation: [https://docs.totistack.dev](https://docs.totistack.dev)
- Discord Community: [https://discord.gg/totistack](https://discord.gg/totistack)

---

**Built with ❤️ using Totistack - The Modular Business App Framework**
