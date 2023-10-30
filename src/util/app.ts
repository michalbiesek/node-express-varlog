import express, { Express } from 'express';
import * as varLogController from "../controllers/log";
import { simpleLogger } from '../middlewares/logger';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const PORT = process.env.PORT || 3001

// Create Express server
const app: Express = express();


// Express configuration
app.set("port", PORT);
app.use(simpleLogger);

/**
 * @openapi
 * /list:
 *   get:
 *     summary: Get a list of log files.
 *     description: Retrieve a list of log files from the server.
 *     responses:
 *       200:
 *         description: A JSON array of log file names.
 *         content:
 *           application/json:
 *             example:
 *               files: ["syslog", "apport.log", ...]
 */
app.get("/list", varLogController.listLogFiles);

/**
 * @openapi
 * /logs:
 *   get:
 *     summary: Retrieve log data
 *     description: Retrieve log data from /var/log.
 *     parameters:
 *       - in: query
 *         name: file
 *         description: Name of the log file to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: n
 *         description: Number of log lines to retrieve (default is all).
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         description: Keyword for filtering log entries.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log data retrieved successfully.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing required data file name.
 *       403:
 *         description: Access to file is denied.
 *       404:
 *         description: File is not found.
 * 
 */
app.get("/logs", varLogController.processLogFile);

// Swagger configuration options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Log API',
      version: '1.0.0',
      description: 'API for managing log files in /var/log',
    },
  },
  apis: ['./dist/util/app.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default app;