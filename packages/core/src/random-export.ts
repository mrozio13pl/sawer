import { customAlphabet } from 'nanoid';

export const randomExport = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_',
    10
);
