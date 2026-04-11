/**
 * CRM App Manifest
 * @file app.manifest.js
 * @module apps/crm
 * @description Complete Customer Relationship Management system
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'crm',
  name: 'CRM',
  version: '2.0.0',
  description: 'Complete Customer Relationship Management with sales pipeline, contacts, and activities',
  
  dependencies: {
    features: ['auth', 'rbac', 'media', 'analytics', 'workflow', 'search'],
    apps: ['client-records', 'orders', 'booking']
  },
  
  navigation: {
    icon: 'Building2',
    priority: 1,
    roles: ['admin', 'manager', 'sales']
  },
  
  collections: [
    // Core CRM entities
    'crm_leads',
    'crm_contacts',
    'crm_accounts',
    'crm_opportunities',
    'crm_activities',
    'crm_tasks',
    'crm_calls',
    'crm_meetings',
    'crm_notes',
    
    // Sales pipeline
    'crm_stages',
    'crm_pipeline',
    'crm_deals',
    'crm_quotes',
    'crm_orders',
    
    // Marketing
    'crm_campaigns',
    'crm_segments',
    'crm_email_templates',
    
    // Settings
    'crm_users',
    'crm_teams',
    'crm_roles'
  ],
  
  routes: [
    // Dashboard
    { path: '/crm', name: 'crm-dashboard', component: 'CrmDashboard', meta: { requiresAuth: true } },
    
    // Sales
    { path: '/crm/leads', name: 'crm-leads', component: 'LeadsList', meta: { requiresAuth: true } },
    { path: '/crm/leads/:id', name: 'crm-lead-detail', component: 'LeadDetail', meta: { requiresAuth: true } },
    { path: '/crm/opportunities', name: 'crm-opportunities', component: 'OpportunitiesList', meta: { requiresAuth: true } },
    { path: '/crm/deals/pipeline', name: 'crm-pipeline', component: 'PipelineView', meta: { requiresAuth: true } },
    { path: '/crm/quotes', name: 'crm-quotes', component: 'QuotesList', meta: { requiresAuth: true } },
    
    // Contacts
    { path: '/crm/contacts', name: 'crm-contacts', component: 'ContactsList', meta: { requiresAuth: true } },
    { path: '/crm/accounts', name: 'crm-accounts', component: 'AccountsList', meta: { requiresAuth: true } },
    
    // Activities
    { path: '/crm/activities', name: 'crm-activities', component: 'ActivitiesList', meta: { requiresAuth: true } },
    { path: '/crm/tasks', name: 'crm-tasks', component: 'TasksList', meta: { requiresAuth: true } },
    { path: '/crm/calendar', name: 'crm-calendar', component: 'CalendarView', meta: { requiresAuth: true } },
    
    // Marketing
    { path: '/crm/campaigns', name: 'crm-campaigns', component: 'CampaignsList', meta: { requiresAuth: true } },
    { path: '/crm/segments', name: 'crm-segments', component: 'SegmentsList', meta: { requiresAuth: true } },
    
    // Reports
    { path: '/crm/reports', name: 'crm-reports', component: 'ReportsView', meta: { requiresAuth: true } },
    { path: '/crm/analytics', name: 'crm-analytics', component: 'AnalyticsView', meta: { requiresAuth: true } }
  ],
  
  hooks: [
    'onLeadCreated',
    'onOpportunityWon',
    'onDealClosed',
    'onActivityLogged',
    'onTaskCompleted',
    'onStageChanged'
  ]
};