/**
 * @file src/apps/finance/navigation.js
 * @description Navigation contribution for the finance app.
 */

export default [
  {
    id: 'finance-dashboard',
    label: 'Finance',
    to: '/finance',
    icon: 'Landmark',
    order: 40,
  },
  {
    id: 'finance-transactions',
    label: 'Transactions',
    to: '/finance/transactions',
    icon: 'ReceiptText',
    order: 41,
  },
  {
    id: 'finance-accounts',
    label: 'Accounts',
    to: '/finance/accounts',
    icon: 'BookOpenText',
    order: 42,
  },
  {
    id: 'finance-reports',
    label: 'Reports',
    to: '/finance/reports',
    icon: 'ChartNoAxesColumn',
    order: 43,
  },
]
