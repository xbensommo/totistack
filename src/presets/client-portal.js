export default {
  name: 'client-portal',
  title: 'Client Portal',
  description: 'Secure portal for clients to log in, view records, manage requests, and access protected content.',
  features: ['auth', 'dashboard', 'notifications'],
  options: {
    kind: 'portal',
    package: 'portal',
  },
};