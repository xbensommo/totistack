import fs from 'fs/promises';
import path from 'path';

export async function ensureProjectRoot(projectRoot) {
  await fs.mkdir(projectRoot, { recursive: true });
}

export async function isNodeProject(projectRoot) {
  try {
    await fs.access(path.join(projectRoot, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

export async function ensureBasePackageJson(projectRoot, projectName) {
  const pkgPath = path.join(projectRoot, 'package.json');

  try {
    await fs.access(pkgPath);
  } catch {
    const pkg = {
      name: projectName,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {},
      devDependencies: {},
    };

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }
}