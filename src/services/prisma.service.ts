import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { pagination, paginate } from 'prisma-extension-pagination';

type ExtendedPrismaClient = PrismaClient & ReturnType<typeof extendedPrismaClient>;

const extendedPrismaClient = (prisma: PrismaClient) => prisma.$extends(pagination());
@Service()
export class PrismaService {
  public prisma: ExtendedPrismaClient;
  public user: ExtendedPrismaClient['user'];
  public challangelog: PrismaClient['challangelog'];
  public course: PrismaClient['course'];
  public lecture: PrismaClient['lecture'];
  public answer: PrismaClient['answer'];
  public question: PrismaClient['question'];
  public userCoursesMapping: PrismaClient['userCoursesMapping'];
  public userLectureMapping: PrismaClient['userLectureMapping'];
  public claims: PrismaClient['claims'];
  public courseStatusLog: PrismaClient['courseStatusLog'];
  public searchQuery: PrismaClient['searchQuery'];
  public courseStatusHistoryForAdmin: PrismaClient['courseStatusHistoryForAdmin'];
  public log: PrismaClient['log'];

  constructor() {
    const basePrisma = new PrismaClient();
    this.prisma = extendedPrismaClient(basePrisma) as ExtendedPrismaClient;
    this.user = this.prisma.user;
    this.challangelog = this.prisma.challangelog;
    this.answer = this.prisma.answer;
    this.course = this.prisma.course;
    this.lecture = this.prisma.lecture;
    this.question = this.prisma.question;
    this.userCoursesMapping = this.prisma.userCoursesMapping;
    this.userLectureMapping = this.prisma.userLectureMapping;
    this.claims = this.prisma.claims;
    this.courseStatusLog = this.prisma.courseStatusLog;
    this.searchQuery = this.prisma.searchQuery;
    this.log = this.prisma.log;
  }
}
