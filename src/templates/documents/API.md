markdown
# API Documentation

## Base URL
{{apiBaseUrl}}

## Authentication
All API requests require a valid Firebase ID token in the Authorization header:
Authorization: Bearer <your-token>

text

## Endpoints

### Users

#### Get Current User
```http
GET /api/users/me
Response:

json
{
  "id": "user123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
Collections
{{#each collections}}

{{this.name}}
GET /api/{{this.path}} - List items
GET /api/{{this.path}}/:id - Get item
POST /api/{{this.path}} - Create item
PATCH /api/{{this.path}}/:id - Update item
DELETE /api/{{this.path}}/:id - Delete item

{{/each}}

Error Responses
json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
Rate Limits
Authenticated: 1000 requests/hour

Unauthenticated: 100 requests/hour

text

---

## ROOT FILES

### File: `package.json`

```json
{
  "name": "@xbensommo/totistack",
  "version": "2.0.0",
  "description": "Totistack v2 - Modular business application framework",
  "type": "module",
  "bin": {
    "toti": "./bin/toti.js"
  },
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./cli": "./src/cli/index.js",
    "./core": "./src/core/index.js"
  },
  "scripts": {
    "dev": "node bin/toti.js",
    "test": "node --test",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  },
  "keywords": [
    "totistack",
    "vue",
    "firebase",
    "framework",
    "cli",
    "scaffolding"
  ],
  "author": "xbensommo",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "inquirer": "^9.2.12",
    "chalk": "^5.3.0",
    "ora": "^8.0.1",
    "fs-extra": "^11.2.0",
    "execa": "^8.0.1",
    "glob": "^10.3.10"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "nodemon": "^3.0.2"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/xbensommo/totistack.git"
  },
  "bugs": {
    "url": "https://github.com/xbensommo/totistack/issues"
  },
  "homepage": "https://totistack.dev"
}