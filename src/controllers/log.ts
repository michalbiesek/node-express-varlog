import { Request, Response } from 'express';
import * as path from 'path';
import { constants, promises } from 'fs';
import { isErrnoException } from '../util/isErrnoException';
import { logPath } from '../configuration/cfg';
import { createBackwardReadStream } from '../stream/backwardReadStream';

// Process Log file
export const processLogFile = async (req: Request, res: Response) => {
    const userFileName = req.query.file;
    const queryN = req.query.n;
    const numberEntries = (typeof queryN === 'string') ? parseInt(queryN, 10) : Number.MAX_VALUE;
    const keyWord = (typeof req.query.keyword === 'string') ? req.query.keyword : "";

    if (!userFileName) {
        return res.status(400).json({ error: 'Bad Request - Missing required data: file' });
    }

    if (userFileName !== path.basename(userFileName as string)) {
        return res.status(400).json({ error: 'Bad Request - file can not be a path' });
    }

    // Validate number entires
    if (isNaN(numberEntries)) {
        return res.status(400).json({ error: 'Bad Request - n is not a number' });
    }

    const userFilePath = logPath(userFileName);

    // Validate the user Input path
    try {
        await promises.access(userFilePath, constants.R_OK);
    } catch (err: unknown) {
        if (isErrnoException(err)) {
            if (err.code === 'EPERM') {
                return res.status(403).json({ error: 'Access to file is denied' });
            }
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'file not found' });
            }
        }
        return res.status(400).json({ error: err });
    }

    // Set the response content type to text/plain
    res.setHeader('Content-Type', 'text/plain');

    let parsedLinesCounter = 0;

    // Create stream and pipe it to write
    const fStream = createBackwardReadStream(userFilePath);
    fStream.on('error', (err) => {
        console.error('Error:', err);
        res.status(500).end('Internal Server Error');
    });

    fStream.on('data', function (line) {
        if (parsedLinesCounter >= numberEntries) {
            fStream.destroy();
            return;
        }

        if (line.includes(keyWord)) {
            res.write(line);
            parsedLinesCounter++;
        }
    })

    fStream.on('close', function () {
        res.end();
    })
};

// Listing the Log files
export const listLogFiles = async (_req: Request, res: Response) => {
    const logDirPath = logPath('');
    try {
        const files = await promises.readdir(logDirPath);
        res.json({ files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to list files in ${logDirPath}` });
    }
};