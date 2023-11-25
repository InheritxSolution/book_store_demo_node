import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    Logger.log(`${new Date().toISOString()} [${req.ip} ${req.method}] ${req.originalUrl}`)
    
    // Ends middleware function execution, hence allowing to move on 
    if (next) {
      next();
    }
  }
}