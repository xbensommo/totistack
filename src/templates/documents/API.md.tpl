<!--
  @file API.md
  @description API documentation for the generated project
  @date 2026-03-22
  @author Totistack Team
-->

# API Documentation: {{appName}}

## 🌐 Base URL

```
{{apiBaseUrl}}
```

## 🔐 Authentication

All API endpoints require authentication using Firebase Authentication tokens.

### Authentication Header

```
Authorization: Bearer <firebase-id-token>
```

### Login Flow

1. Client authenticates with Firebase Auth
2. Receive ID token
3. Include token in subsequent requests

## 📦 Endpoints

### Users

#### Get Current User
```http
GET /api/users/me
```

**Response**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "roles": ["user"],
  "permissions": ["read:users"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Current User
```http
PATCH /api/users/me
```

**Request Body**
```json
{
  "displayName": "New Name",
  "photoURL": "https://..."
}
```

### Collections

{{#each collections}}

#### {{this.name}}

**Base URL**: `/api/{{this.path}}`

##### List Items
```http
GET /api/{{this.path}}
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 25) |
| sort | string | Sort field |
| order | string | Sort order (asc/desc) |
| {{#each this.filters}} | | |
| {{this.name}} | {{this.type}} | {{this.description}} |
| {{/each}} |

**Response**
```json
{
  "data": [
    {
      "id": "item1",
      {{#each this.fields}}
      "{{this.name}}": {{this.example}},
      {{/each}}
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "pages": 4
  }
}
```

##### Get Item
```http
GET /api/{{this.path}}/:id
```

**Response**
```json
{
  "id": "item1",
  {{#each this.fields}}
  "{{this.name}}": {{this.example}},
  {{/each}}
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

##### Create Item
```http
POST /api/{{this.path}}
```

**Request Body**
```json
{
  {{#each this.fields}}
  {{#unless this.readOnly}}
  "{{this.name}}": {{this.example}},
  {{/unless}}
  {{/each}}
}
```

**Response**: `201 Created` with created item

##### Update Item
```http
PATCH /api/{{this.path}}/:id
```

**Request Body**
```json
{
  {{#each this.fields}}
  {{#if this.updatable}}
  "{{this.name}}": {{this.example}},
  {{/if}}
  {{/each}}
}
```

**Response**: `200 OK` with updated item

##### Delete Item
```http
DELETE /api/{{this.path}}/:id
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| hard | boolean | Permanently delete (default: false) |

**Response**: `204 No Content`

{{/each}}

## 🔌 Custom Endpoints

{{#each customEndpoints}}

### {{this.name}}

**URL**: `{{this.method}} /api/{{this.path}}`

**Description**: {{this.description}}

**Authentication**: {{this.auth}}

**Request Body**
```json
{{this.requestExample}}
```

**Response**
```json
{{this.responseExample}}
```

{{/each}}

## 📊 WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://{{domain}}/ws');
```

### Events

#### Global Events

| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `{type, message, data}` | System notifications |
| `entity:created` | `{collection, id, data}` | New entity created |
| `entity:updated` | `{collection, id, changes}` | Entity updated |
| `entity:deleted` | `{collection, id}` | Entity deleted |

#### Module-Specific Events

{{#each moduleEvents}}
**{{this.module}}**
| Event | Payload | Description |
|-------|---------|-------------|
{{#each this.events}}
| `{{this.name}}` | `{{this.payload}}` | {{this.description}} |
{{/each}}
{{/each}}

### Subscription

```javascript
// Subscribe to events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'notifications'
}));

// Listen for events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
};
```

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## 🚦 Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authenticated | 1000 | hour |
| Unauthenticated | 100 | hour |
| Bulk operations | 100 | minute |
| File uploads | 50 | hour |

Headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔄 Pagination

All list endpoints support pagination with:

- `page`: Page number (1-indexed)
- `limit`: Items per page (max 100)
- `cursor`: Cursor for cursor-based pagination

### Cursor-Based Pagination

```http
GET /api/items?cursor=abc123&limit=25
```

Response includes `nextCursor` field for next page.

## 🔍 Filtering

### Basic Filters

```http
GET /api/items?status=active&category=products
```

### Advanced Filters

```http
GET /api/items?filter[price][gte]=100&filter[price][lte]=500
GET /api/items?filter[name][contains]=phone
GET /api/items?filter[createdAt][between]=2024-01-01,2024-12-31
```

### Sorting

```http
GET /api/items?sort=-createdAt,name
# Negative sign for descending order
```

## 📤 File Uploads

### Upload Endpoint
```http
POST /api/upload
Content-Type: multipart/form-data
```

**Parameters**
| Name | Type | Description |
|------|------|-------------|
| file | file | File to upload |
| type | string | File type (image/document) |
| collection | string | Related collection |

**Response**
```json
{
  "id": "file123",
  "url": "https://storage.googleapis.com/...",
  "name": "image.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

## 🔄 Batch Operations

### Bulk Create
```http
POST /api/batch/{{collection}}
```

**Request Body**
```json
{
  "operations": [
    { "method": "create", "data": {...} },
    { "method": "create", "data": {...} }
  ]
}
```

### Bulk Update
```http
PATCH /api/batch/{{collection}}
```

**Request Body**
```json
{
  "operations": [
    { "id": "id1", "data": {...} },
    { "id": "id2", "data": {...} }
  ]
}
```

## 📈 Webhooks

### Configure Webhook
```http
POST /api/webhooks
```

**Request Body**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["entity.created", "entity.updated"],
  "secret": "your-secret-key"
}
```

### Webhook Payload
```json
{
  "id": "evt_123",
  "type": "entity.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "collection": "users",
    "id": "user123",
    "changes": {...}
  }
}
```

## 🧪 Testing

### Postman Collection

Import the Postman collection:
```bash
curl -O {{postmanCollectionUrl}}
```

### Example Requests

```bash
# Get users
curl -X GET "{{apiBaseUrl}}/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create item
curl -X POST "{{apiBaseUrl}}/api/items" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Example"}'
```

## 📞 Support

For API support:
- **Documentation**: {{docsUrl}}
- **Issues**: {{issuesUrl}}
- **Email**: {{apiSupportEmail}}

---

**API Version**: 1.0.0  
**Last Updated**: {{currentDate}}  
**Maintainer**: {{apiMaintainer}}