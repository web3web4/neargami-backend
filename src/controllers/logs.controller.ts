import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { LogsService } from '../services/logs.service';

@Service() // Add this decorator to register CourseController
export class LogController {
  private logsService = Container.get(LogsService);

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.logsService.getLogs();
      res.status(201).json({ message: 'foundAll', data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
