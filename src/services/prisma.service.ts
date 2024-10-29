import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class PrismaService {
  public prisma: PrismaClient;
  public user: PrismaClient['user'];
  public course: PrismaClient['course'];
  public lecture: PrismaClient['lecture'];
  public answer: PrismaClient['answer'];
  public question: PrismaClient['question'];
  public userCoursesMapping: PrismaClient['userCoursesMapping'];
  public userLectureMapping: PrismaClient['userLectureMapping'];
  public claims: PrismaClient['claims'];
  public courseStatusLog: PrismaClient['courseStatusLog'];

  constructor() {
    this.prisma = new PrismaClient();
    this.user = this.prisma.user;
    this.answer = this.prisma.answer;
    this.course = this.prisma.course;
    this.lecture = this.prisma.lecture;
    this.question = this.prisma.question;
    this.userCoursesMapping = this.prisma.userCoursesMapping;
    this.userLectureMapping = this.prisma.userLectureMapping;
    this.claims = this.prisma.claims;
    this.courseStatusLog = this.prisma.courseStatusLog;
  }
}
