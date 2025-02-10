import { Log } from '@prisma/client';
import Container, { Service } from 'typedi';
import { PrismaService } from './prisma.service';
@Service()
export class LogsService {
  private prismaService = Container.get(PrismaService);
  private logs = this.prismaService.log;

  public getLogs(): Promise<Log[]> {
    return this.logs.findMany();
  }
}
