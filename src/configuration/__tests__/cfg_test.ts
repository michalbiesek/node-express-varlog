import { describe, expect, test } from '@jest/globals';
import { logPath } from '../cfg';

describe('Configruation', () => {
    test('default log Path', () => {
        const res = logPath('');
        expect(res).toBe('/var/log/');
    });

    test('default log Path', () => {
        process.env.LOG_DIR_PATH = "lorem/ipsum"
        const res = logPath('');
        expect(res).toBe('lorem/ipsum');
    });
});