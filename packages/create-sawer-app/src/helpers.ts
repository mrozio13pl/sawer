import fs from 'node:fs';
import { AgentName } from 'package-manager-detector';

export function validatePath(path: string) {
    if (!path) return 'Project name is required';
    if (path.includes(' ')) return 'Project name cannot contain spaces';
    if (fs.existsSync(path)) return 'Directory already exists';
}

export function isValidPackageManager(pkgManager: string): pkgManager is AgentName {
    return ['npm', 'yarn', 'pnpm', 'bun'].includes(pkgManager as AgentName);
}
