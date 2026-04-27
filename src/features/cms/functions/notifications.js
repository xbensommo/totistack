/** @file src/features/cms/functions/notifications.js */
export const notificationDefinitions = [
  { type: 'cms.page.published', title: 'Page published', message: '{{meta.title}} is now published.', entityType: 'cmsPage', priority: 'normal', delivery: { push: true } },
  { type: 'cms.page.unpublished', title: 'Page unpublished', message: '{{meta.title}} was unpublished.', entityType: 'cmsPage', priority: 'normal', delivery: { push: true } },
  { type: 'cms.page.archived', title: 'Page archived', message: '{{meta.title}} was archived.', entityType: 'cmsPage', priority: 'normal', delivery: { push: true } },
  { type: 'cms.page.restored', title: 'Page restored', message: '{{meta.title}} was restored to draft.', entityType: 'cmsPage', priority: 'normal', delivery: { push: true } },
  { type: 'cms.page.deleted', title: 'Page deleted', message: '{{meta.title}} was deleted.', entityType: 'cmsPage', priority: 'high', delivery: { push: true } },
  { type: 'cms.entry.published', title: 'Entry published', message: '{{meta.title}} is now published.', entityType: 'cmsEntry', priority: 'normal', delivery: { push: true } },
  { type: 'cms.entry.unpublished', title: 'Entry unpublished', message: '{{meta.title}} was unpublished.', entityType: 'cmsEntry', priority: 'normal', delivery: { push: true } },
  { type: 'cms.redirect.created', title: 'Redirect created', message: 'Redirect {{meta.fromPath}} → {{meta.toPath}} was created.', entityType: 'cmsRedirect', priority: 'normal', delivery: { push: true } },
]

export default notificationDefinitions
