import type { Agent } from 'package-manager-detector';

export interface CreateSawerAppOptions {
    path: string;
    typescript: boolean;
    javascript: boolean;
    jsdoc: boolean;
    install: boolean;
    pkgManager: Agent;
    yes: boolean;
}
