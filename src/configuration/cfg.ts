import * as path from 'path';


const LOG_DIR_PATH = '/var/log/';

export function logPath(filename: string): string {
    const base = process.env.LOG_DIR_PATH || LOG_DIR_PATH;
    return path.join(base, filename);
}