export default {
  id: 'database-manager',
  name: 'Database Manager',
  version: '1.0.0',
  description: 'Firestore collection inspector, seed data, schema viewer.',
  dependencies: {
    features: ['auth', 'rbac']
  },
  collections: [
    '_admin_logs',
    '_seed_records'
  ]
};
 