
import { Request, Response, NextFunction } from 'express';

// Log the request details to the console
export function simpleLogger(req: Request, _res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;

    console.log(`[${timestamp}] ${method} ${url}`);
    next();
}
