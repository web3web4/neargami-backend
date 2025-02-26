import { Log } from '@prisma/client';
import Container, { Service } from 'typedi';
import { PrismaService } from './prisma.service';
@Service()
export class LogsService {
  private prismaService = Container.get(PrismaService);
  private logs = this.prismaService.log;

  public async getLogs(): Promise<Log[]> {
    return await this.logs.findMany();
  }
}
