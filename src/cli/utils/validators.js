export function validateProjectName(input) {
  if (!input || input.trim() === '') {
    return 'Project name is required';
  }
  if (!/^[a-z0-9-]+$/.test(input)) {
    return 'Project name can only contain lowercase letters, numbers, and hyphens';
  }
  return true;
}