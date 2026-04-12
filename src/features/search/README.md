# Search feature

Enterprise-ready starter feature for:

- search index metadata
- query logging
- synonym management
- public and admin search UI shells

## Production note

For larger projects, move ranking and indexing into a background worker or dedicated search backend. This starter feature keeps search logic framework-local so it is easy to replace later.
