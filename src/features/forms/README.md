# Forms feature

Enterprise-ready starter feature for:

- form definitions
- field configuration
- public form rendering
- submissions inbox
- webhook handoff

## Totistack compatibility

This feature is declarative and expects:

- a root `appStore`
- generated collection actions for `forms`, `formFields`, `formSubmissions`, and `formWebhooks`
- root auth/rbac integration
- one shared shard-provider managed by Totistack core
