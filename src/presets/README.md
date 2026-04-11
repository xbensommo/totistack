# Totistack Presets

This directory contains predefined presets that bundle multiple apps and features together.

## Available Presets

### Business Core (`business-core`)
Complete business foundation with CRM, forms, dashboard, and core features.
- **Apps**: CRM, Forms, Dashboard, Client Records
- **Features**: Auth, RBAC, Analytics, Notifications, Audit Logs

### Service Business (`service-business`)
Perfect for service-based businesses with booking, messaging, and payments.
- **Apps**: Booking Platform, Messaging, Payments, Notifications
- **Features**: Auth, Workflows, Search, Media

### E-Commerce Suite (`commerce`)
Complete e-commerce solution with catalog, payments, and content management.
- **Apps**: Catalog, Payments, CMS, Forms
- **Features**: Auth, Search, Analytics, Media

### Internal Operations (`internal-ops`)
Internal operations management with CRM, CMS, and workflow automation.
- **Apps**: CRM, CMS, Workflows, Dashboard
- **Features**: Auth, RBAC, Audit Logs, Analytics

### CRM Suite (`crm-suite`)
Complete CRM solution with sales, marketing, and customer support.
- **Apps**: CRM, Messaging, Dashboard, Notifications, Forms
- **Features**: Auth, RBAC, Analytics, Workflows, Search, Audit Logs

## Creating Custom Presets

To create a custom preset, add a new `.preset.js` file with the following structure:

```javascript
export default {
  id: 'my-custom-preset',
  name: 'My Custom Preset',
  description: 'Description of the preset',
  version: '1.0.0',
  
  apps: ['app1', 'app2'],
  features: ['feature1', 'feature2'],
  
  config: {
    branding: {
      appName: 'Custom App Name'
    }
  },
  
  dependencies: ['some-package']
};