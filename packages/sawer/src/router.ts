import type { Method } from '@sawerjs/types';

export { Trouter as default } from 'trouter';
export const METHODS = ['GET', 'HEAD', 'PATCH', 'OPTIONS', 'CONNECT', 'DELETE', 'TRACE', 'POST', 'PUT'] as readonly Method[];
