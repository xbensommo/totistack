export function requireValue(value) {
  return String(value || '').trim().length > 0;
}

export function validateSharedDocument(document) {
  const errors = [];
  if (!requireValue(document?.meta?.title)) errors.push('Document title is required.');
  if (!requireValue(document?.parties?.issuer?.companyName)) errors.push('Issuer company name is required.');
  if (!requireValue(document?.parties?.client?.companyName)) errors.push('Client company name is required.');
  return errors;
}
