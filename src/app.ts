import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { Container } from 'typedi';
import winston from 'winston';
//import errorHandler from '../src/middlewares/error.middleware'; // Adjust the path to your middleware
///import { useContainer } from "typedi";
// Set typedi container globally for dependency injection
//useContainer(Container);
import http from 'http';

// Create the HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: '*', credentials: CREDENTIALS, allowedHeaders: ['Authorization', 'Content-Type'] }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      console.log(`Initializing route: ${route.constructor.name}`);
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  // Configure Winston to log to a file and the console
  logger = winston.createLogger({
    level: 'error', // Only log errors (adjust if needed)
    format: winston.format.combine(
      winston.format.timestamp(), // Include timestamps
      winston.format.json(), // Log in JSON format for better structure
    ),
    transports: [
      new winston.transports.File({ filename: 'error.log' }), // Log to error.log file
      new winston.transports.Console({ format: winston.format.simple() }), // Also log to console
    ],
  });

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware);
    // Global handler for uncaught exceptions
    process.on('uncaughtException', (err: Error): void => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
      process.exit(1); // Optionally exit the process
    });
  }
}
