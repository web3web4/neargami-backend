import { PrismaClient, Course, User, Prisma, SearchQuery, Lecture, Question, UserCoursesMapping, UserLectureMapping, Answer, UserQuestionAnswer } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import Container, { Service } from 'typedi';
import { HttpException } from '../exceptions/HttpException';
import { SUPER_ADMIN_PASS } from '../config';
import { PrismaService } from './prisma.service';
import { max } from 'class-validator';
import { MailService } from './mail.service';
import Fuse from 'fuse.js';
import { version } from 'os';
import _ from 'lodash';

@Service()
export class CourseService {
  private prismaService = Container.get(PrismaService);
  private mailService = Container.get(MailService);
  private course = this.prismaService.course;
  private coursestatuslog = this.prismaService.courseStatusLog;
  private prisma = this.prismaService.prisma;
  private searchQuery = this.prismaService.searchQuery;
  public findLatestVersion = this.prismaService.course;
  static findLatestVersion: any;

  public async getAllUsersStartingCourse(course_id: number) {
    const users = await this.prisma.userCoursesMapping.findMany({ where: { course_id } });
    const AllUsers = await this.prisma.user.findMany({ where: { id: { in: users.map(user => user.user_id) } } });
    return AllUsers;
  }
  public async getCourseStatusLog(courseSlug: string) {
    const course = await this.course.findFirst({ where: { slug: courseSlug }, include: { CourseStatusLog: true } });
  }

  // Output: A random UUID like 'e58d48b6-2e34-4c41-9f5d-3bb7b02d3c4e'

  public async search(searchQuery: string): Promise<Course[]> {
    const sanitizedQuery = searchQuery.toLowerCase().trim();
    const courses = await this.course.findMany({
      where: {
        OR: [
          {
            title: { contains: sanitizedQuery, mode: 'insensitive' },
          },
          {
            description: { contains: sanitizedQuery, mode: 'insensitive' },
          },
          {
            lecture: {
              some: {
                OR: [
                  { title: { contains: sanitizedQuery, mode: 'insensitive' } },
                  { description: { contains: sanitizedQuery, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            description: true,
          },
          where: {
            OR: [{ title: { contains: sanitizedQuery, mode: 'insensitive' } }, { description: { contains: sanitizedQuery, mode: 'insensitive' } }],
          },
        },
      },
    });
    if (courses.length === 0) {
      await this.logSearchQuery(sanitizedQuery);
    }
    return courses;
  }

  /**
   * Logs the search query for analytics or future use.
   * @param query - The sanitized query to log
   */
  private async logSearchQuery(query: string): Promise<void> {
    const keywords = query.split(/\s+/);
    const now = new Date();
    console.log(keywords);
    for (const keyword of keywords) {
      try {
        await this.searchQuery.upsert({
          where: { keyword },
          update: {
            query: { push: query },
            timestamp: now,
          },
          create: {
            query: [query],
            keyword: keyword,
            timestamp: now,
          },
        });
      } catch (error) {
        throw new HttpException(500, 'Failed to log search query');
      }
    }
    console.log('h');
  }

  public async getKeywords(): Promise<SearchQuery[]> {
    const keywords = await this.searchQuery.findMany();

    return keywords;
  }

  public async createNewCourse(teacher_user_id: string, data1: CreateCourseDto, sluge: string): Promise<Course> {
    const newCourse= this.course.create({
      data: {
      
        teacher_user_id: teacher_user_id,
        publish_status: Status.DRAFT,
        slug: sluge,
        ...data1,version:1
      },
    });

  return newCourse;
  }
  public async related_createNewCourse(id:number): Promise<Course> {

    return await this.course.update({where:{id},data:{parent_version_id:id}});
  }
  async createNewVersion(
    id: number,
    prevcourseversion: Course,
    user_id: string, slug:string
  ): Promise<Course> {

    // Check if the user is the teacher of the course
    if (prevcourseversion.teacher_user_id !== user_id) {
      throw new HttpException(403, 'Forbidden');
    }
  
    // Get the latest version by selecting the highest version number
    const latestVersion = await this.course.aggregate({
      where: { parent_version_id: id ,publish_status:'APPROVED'},
      _max: { version: true },
    });
  
    // Determine the new version number
    let version = 1; // Default to version 1 if no previous versions exist
    if (latestVersion._max.version !== null) {
      version = latestVersion._max.version + 0.1;
    }
    
    const description=prevcourseversion.description;
   const difficulty=prevcourseversion.difficulty;
  const language=prevcourseversion.language;
   const logo=prevcourseversion.logo;
   const name=prevcourseversion.name;
   const tag=prevcourseversion.tag;
   const title=prevcourseversion.title;
  const parent_version_id= prevcourseversion.id;
  const teacher_user_id=prevcourseversion.teacher_user_id;
    // Create the new version
    const newVersion = await this.course.create({
      data: {
        description,difficulty,language,logo,name,tag,title,
        version,
        publish_status: 'DRAFT',
        parent_version_id,
        slug,
        teacher_user_id
      }
    });
  
    return newVersion;
  }
  public async createLectureVersion(
    userId: string,
    id: number,
    Lectures: Lecture[],
    
  ): Promise<any> {
    // If Lectures is empty, return null or an empty array to allow the controller to continue.
    if (!Lectures || Lectures.length === 0) {
      return []; // or return null if you prefer
    }
  
    // Create lectures concurrently
    const newLectures = await Promise.all(
      Lectures.map((lecture) =>
        this.prisma.lecture.create({
          data: {
            course_id:id,
            title: lecture.title,
            description: lecture.description,
            pre_note: lecture.pre_note,
            next_note: lecture.next_note,
            order: lecture.order,
            slug: lecture.slug,
          },
        })
      )
    );
  
    return newLectures; // Returns an array of created lectures
  }
   public async updateLecture(id:number,slug:string):Promise<Lecture>{

    return await this.prisma.lecture.update({where:{id},data:{slug}})
   }
   public async creatnewUserCourse(id:number,userCourses:UserCoursesMapping[]):Promise<UserCoursesMapping[]>{
   if(!userCourses){return[]}
    const userCourse=await Promise.all(userCourses.map((userCourse)=> this.prisma.userCoursesMapping.create({
      data:{course_id:id,start_time:userCourse.start_time,
        end_time:userCourse.end_time,user_id:userCourse.user_id,
      }
    })))
    return userCourse;
   }
   public async creatnewUserLecture(id:number,userLectures:UserLectureMapping[],
    oldLectures:Lecture[],newLectureswithNewIds:Lecture[]):Promise<UserLectureMapping[]>{
if(userLectures==null){return []}  
for (let i=0;i<oldLectures.length;i++)
  for(let j=0;j<newLectureswithNewIds.length;j++)
   if(oldLectures[i].slug==newLectureswithNewIds[j].slug)
    for (let k=0;k<userLectures.length;k++)
      if(userLectures[k].lecture_id==oldLectures[i].id)
        userLectures[k].lecture_id=newLectureswithNewIds[j].id;

    const userLecture=await Promise.all(userLectures.map((userLecture)=> this.prisma.userLectureMapping.create({
      data:{course_id:id,user_id:userLecture.user_id,lecture_id:userLecture.lecture_id,
        start_at:userLecture.start_at,end_at:userLecture.end_at,
        score:userLecture.score
      }
    })))
    return userLecture;
   }
   public async creatnewLectureQuestion(lectureQuestions:Question[],
    oldLectures:Lecture[],newLectureswithNewIds:Lecture[],answersQuestions:Answer[]):Promise<any>{
    if(!lectureQuestions){return []}
    for (let i=0;i<oldLectures.length;i++)
      for(let j=0;j<newLectureswithNewIds.length;j++)
       if(oldLectures[i].slug==newLectureswithNewIds[j].slug)
        for (let k=0;k<lectureQuestions.length;k++)
          if(lectureQuestions[k].lecture_id==oldLectures[i].id)
            lectureQuestions[k].lecture_id=newLectureswithNewIds[j].id;
        



      
    const createdQuestions=await Promise.all(lectureQuestions.map((lectureQuestion)=> this.prisma.question.create({
      data:{description:lectureQuestion.description,lecture_id:lectureQuestion.lecture_id,score:lectureQuestion.score

      }
    })))
    const questionIdMap = new Map();
    lectureQuestions.forEach((lectureQuestion, index) => {
      questionIdMap.set(lectureQuestion.id, createdQuestions[index].id);
    });
    const createdAnswers = await Promise.all(
      answersQuestions.map((answerQuestion) =>
        this.prisma.answer.create({
          data: {
            description: answerQuestion.description,
            is_correct: answerQuestion.is_correct,
            question_id: questionIdMap.get(answerQuestion.question_id), // Map old question_id to new question_id
          },
        })
      )
    );
    



    return {createdQuestions,createdAnswers};
   }
   public async creatnewUserAnswersQuestion(course_id:number,userAnswersQuestions:UserQuestionAnswer[],
    oldLectures:Lecture[],newLectures:Lecture[],oldQuestions:Question[],newQuestions:Question[]
   ):Promise<any[]>{
    if(!userAnswersQuestions){return []}
 
  // Step 1: Create mappings from old IDs to new IDs
  const lectureIdMap = new Map<number, number>();
  oldLectures.forEach((oldLecture, index) => {
    lectureIdMap.set(oldLecture.id, newLectures[index].id);
  });

  const questionIdMap = new Map<number, number>();
  oldQuestions.forEach((oldQuestion, index) => {
    questionIdMap.set(oldQuestion.id, newQuestions[index].id);
  });

  // Step 2: Create new UserQuestionAnswer records with correct references
  const newUserAnswersQuestions = await Promise.all(
    userAnswersQuestions.map(async (userAnswer) => {
      // Map old IDs to new IDs
      const newLectureId = lectureIdMap.get(userAnswer.lecture_id);
      const newQuestionId = questionIdMap.get(userAnswer.question_id);

      if (!newLectureId || !newQuestionId) {
        return [];
      }

      // Create new UserQuestionAnswer record
      const newUserAnswer = await this.prisma.userQuestionAnswer.create({
        data: {
          student_id: userAnswer.student_id,
          course_id: course_id, // Use the new course_id
          lecture_id: newLectureId, // Use the mapped lecture_id
          question_id: newQuestionId, // Use the mapped question_id
          answer_id: userAnswer.answer_id, // Assuming answer_id doesn't need mapping
          is_correct: userAnswer.is_correct,
        },
      });

      return newUserAnswer;
    })
  );

  // Step 3: Return the newly created records
  return newUserAnswersQuestions;

   }
   /////////
   
//    public async getAllChanges(courseId:number):Promise<any> {
// const oldVersion=await this.course.findUnique({where:{id:courseId},
//   include:{lecture:{include:{question:{include:{answer:true}},
//   userLecture:true}},userCourses:true,UserQuestionAnswer:true}})
// const pendingVersion=await this.course.findFirst({where:{parent_version_id:courseId,publish_status:'PENDING_REVIEW'},
//   include:{lecture:{include:{question:{include:{answer:true}},
//   userLecture:true}},userCourses:true,UserQuestionAnswer:true}
// })
    
//    }
public async getAllChanges(courseId: number): Promise<any> {
  const oldVersion = await this.course.findUnique({
    where: { id: courseId },
    include: {
      lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
      userCourses: true,
      UserQuestionAnswer: true
    }
  });

  const pendingVersion = await this.course.findFirst({
    where: { parent_version_id: courseId, publish_status: 'PENDING_REVIEW' },
    include: {
      lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
      userCourses: true,
      UserQuestionAnswer: true
    }
  });

  if (!oldVersion || !pendingVersion) return null;

  return {
    lectures: this.findDifferences(oldVersion.lecture, pendingVersion.lecture),
    questions: this.findDifferences(oldVersion.lecture.flatMap((l: any) => l.question), pendingVersion.lecture.flatMap((l: any) => l.question)),
    answers: this.findDifferences(oldVersion.lecture.flatMap((l: any) => l.question.flatMap((q: any) => q.answer)), pendingVersion.lecture.flatMap((l: any) => l.question.flatMap((q: any) => q.answer))),
    userCourses: this.findDifferences(oldVersion.userCourses, pendingVersion.userCourses),
    userAnswers: this.findDifferences(oldVersion.UserQuestionAnswer, pendingVersion.UserQuestionAnswer),
  };
}
public async getAllChangesById(courseId: number): Promise<any> {
  const oldVersion = await this.course.findUnique({
    where: { id: courseId },
    include: {
      lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
      userCourses: true,
      UserQuestionAnswer: true
    }
  });

  const pendingVersion = await this.course.findFirst({
    where: { parent_version_id: courseId, publish_status: 'PENDING_REVIEW' },
    include: {
      lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
      userCourses: true,
      UserQuestionAnswer: true
    }
  });

  if (!oldVersion || !pendingVersion) return { message: "No data found" };

  function compareEntities(oldData: any[], newData: any[]) {
    const added = newData.filter(n => !oldData.some(o => o.id === n.id));
    const updated = newData.filter(n => {
      const old = oldData.find(o => o.id === n.id);
      return old && old.updatedAt !== n.updatedAt;
    });
    const deleted = oldData.filter(o => !newData.some(n => n.id === o.id));

    return { added, updated, deleted };
  }

  return {
    lectures: compareEntities(oldVersion.lecture, pendingVersion.lecture),
    questions: compareEntities(
      oldVersion.lecture.flatMap(l => l.question),
      pendingVersion.lecture.flatMap(l => l.question)
    ),
    answers: compareEntities(
      oldVersion.lecture.flatMap(l => l.question.flatMap(q => q.answer)),
      pendingVersion.lecture.flatMap(l => l.question.flatMap(q => q.answer))
    ),
    userCourses: compareEntities(oldVersion.userCourses, pendingVersion.userCourses),
    userAnswers: compareEntities(oldVersion.UserQuestionAnswer, pendingVersion.UserQuestionAnswer)
  };
}

public findDifferences(oldData: any, newData: any) {
  const changes: any = {
    added: [],
    updated: [],
    deleted: []
  };

  // Find added items
  newData.forEach((newItem: any) => {
    const oldItem = oldData.find((o: any) => o.id === newItem.id);
    if (!oldItem) {
      changes.added.push(newItem);
    } else if (newItem.updatedAt !== oldItem.updatedAt) {
      changes.updated.push({ old: oldItem, new: newItem });
    }
  });

  // Find deleted items
  oldData.forEach((oldItem: any) => {
    const existsInNew = newData.some((n: any) => n.id === oldItem.id);
    if (!existsInNew) {
      changes.deleted.push(oldItem);
    }
  });

  return changes;
}



  //////////
  public async changeStatusFromDraftToPending(id:number,user_id:string):Promise<Course>{
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
  
    // Check if the user is the teacher of the course
    if (course.teacher_user_id !== user_id) {
      throw new HttpException(403, 'Forbidden');
    }
  
    return await this.course.update({where:{id},data:{publish_status:'PENDING_REVIEW'}})
  }
  public async getLastUserId(): Promise<number | null> {
    const lastCourse = await this.course.findFirst({
      orderBy: {
        id: 'desc', // Sort by ID in descending order
      },
      select: {
        id: true, // Select only the ID field
      },
    });

    return lastCourse?.id + 1 || null; // Return the ID or null if no record exists
  }
  public async getUserId(id: number): Promise<number | null> {
    const lastCourse = await this.course.findUnique({
      where: { id },
    });

    return lastCourse?.id || null; // Return the ID or null if no record exists
  }

  public async findUniqueCourseBySlug(slug: string): Promise<Course> {
    return this.course.findFirst({ where: { slug } });
  }
  public async findAllTeacherCourses(id: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ where: { teacher_user_id: id }, include: { lecture: true, teacher: true } });
    return AllCourses;
  }
  public async findAllTeacherCoursesByUserName(username: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        teacher: {
          username: username,
        },
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }

  public async findAllByTag(tag: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [{ publish_status: currentStatus }, { tag: tag }],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }
  public async findAllByTextSearch(phras: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [
          { publish_status: currentStatus }, // Only include courses with 'APPROVED' status
          {
            OR: [{ title: { equals: phras } }, { name: { equals: phras } }, { tag: phras }],
          },
        ],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }

  public async findAllBySubTextSearch(phrase: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [
          { publish_status: currentStatus }, // Only include courses with 'APPROVED' status
          {
            OR: [
              { name: { contains: phrase, mode: 'insensitive' } },
              { title: { contains: phrase, mode: 'insensitive' } },
              { tag: { contains: phrase, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }

  public async findAllCoursesByStatus(id: string): Promise<any> {
    let AllCourses: Course[];
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
    });
    if (id === 'ALL') {
      AllCourses = await this.course.findMany({
        include: { CourseStatusLog: true, lecture: { include: { question: true } }, teacher: true },
      });
    } else {
      AllCourses = await this.course.findMany({
        where: { publish_status: id as Status },

        include: { CourseStatusLog: true, lecture: { include: { question: true } }, teacher: true },
      });
    }
    AllCourses = (AllCourses as any).map(course => ({
      ...course,
      counts: userCoursesCounts.find(c => c.course_id === course.id),
      total_score: course.lecture.reduce((total, lecture) => total + lecture.question.length * 10, 0),
    }));
    return AllCourses;
  }
  public async findAllPage({ offset, limit }: { offset: number; limit: number }): Promise<Course[]> {
    const paginatedCourses: Course[] = await this.course.findMany({
      skip: offset, // Skip the specified number of records
      take: limit, // Limit the number of records fetched
      include: { teacher: true }, // Include related teacher information
    });
    return paginatedCourses;
  }

  public async countAll(): Promise<number> {
    const totalCourses: number = await this.course.count();
    return totalCourses;
  }

  public async findAll(): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ include: { teacher: true } });
    return AllCourses;
  }
  public async findAllWithAuth(id: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ include: { teacher: true } });
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { flags: true },
    });

    if (user?.flags && typeof user.flags === 'object' && !Array.isArray(user.flags)) {
      const updatedFlags = {
        ...(user.flags as Record<string, unknown>), // Explicitly cast as an object
        first_request_approved_courses: true, // Update only this field
      };

      const changeFetchCoursesFlag = await this.prisma.user.update({
        data: { flags: updatedFlags },
        where: { id },
      });
    }
    return AllCourses;
  }

  public async findOne(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id }, include: { lecture: true, userCourses: true } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    return course;
  }
  public async findOneCourse(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id },
      include:{lecture:{include:{question:{include:{answer:true,UserQuestionAnswer:true}},userLecture:true}},userCourses:true,
      UserQuestionAnswer:true}
       });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    return course;
  }
public async findCourseLectures(id :number):Promise<Lecture[]>{
return await this.prisma.lecture.findMany({where:{course_id:id}});
}
public async findAllLectureQuestions(id :number):Promise<Question[]>{

return await this.prisma.question.findMany({where:{id}});
}
  async update(id: number, userId: string, data: UpdateCourseDto, sluge: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    return this.course.update({
      where: { id },
      data: {
        title: data.title,
        publish_status: data.publish_status,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        language: data.language,
        video: data.video,
        logo: data.logo,
        tag: data.tag,
        slug: sluge,
      },
    });
  }

  async findUniqueByTitle(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    return course;
  }
  //////////////////////////////////////

  // update log status for admin user
  async updateLogStatusForAdmin(
    id: number,
    isAdmin: boolean,
    userId: string,
    publish_status: Status,
    publish_status_reson: string,
    sluge: string,
    prevStatus,
  ): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    if (isAdmin == false) {
      throw new HttpException(403, 'this user is not admin to update status');
    }
    const changstatusdate = new Date();

    const statuslog = await this.coursestatuslog.create({
      data: {
        changeStatusReson: publish_status_reson,
        last_publish_status: course.publish_status,
        current_publish_status: publish_status,
        changeStatusDate: changstatusdate,
        course_id: course.id,
      },
    });
    //insert prev_status in table (courseStatusHistoryForAdmin)
    const logStatusForAdmin = await this.prisma.courseStatusHistoryForAdmin.create({
      data: {
        user_id: userId,
        course_id: id,
        prev_status: prevStatus,
        new_status: publish_status,
        create_at: new Date(Date.now()),
      },
    });
    // const sluge=this.stringToSlug(course.title,course.id);
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status, slug: sluge },
    });
  }

  //////////////////////////////
  async updateStatus(id: number, isAdmin: boolean, publish_status: Status, publish_status_reson: string, sluge: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    if (isAdmin == false) {
      throw new HttpException(403, 'this user is not admin to update status');
    }
    const changstatusdate = new Date();

    const statuslog = await this.coursestatuslog.create({
      data: {
        changeStatusReson: publish_status_reson,
        last_publish_status: course.publish_status,
        current_publish_status: publish_status,
        changeStatusDate: changstatusdate,
        course_id: course.id,
      },
    });
    // const sluge=this.stringToSlug(course.title,course.id);
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status, slug: sluge },
    });
  }

  async stringToSlugById(title: string, id: number) {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix = id; // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  }
  async updateForAllSlug() {
    const AllCourses: Course[] = await this.findAll();
    for (let i = 0; i < AllCourses.length; i++) {
      const id = AllCourses[i].id;
      const title = AllCourses[i].title;
      AllCourses[i].slug = await this.stringToSlugById(title, id);
      const sluge = AllCourses[i].slug;
      const updateCourses: Course = await this.course.update({
        where: { id },
        data: {
          slug: sluge,
        },
      });
    }

    //const updatAll= await this.course.updateMany({data:AllCourses});
    return AllCourses;
  }

  async delete(id: number, userId: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    if (course.publish_status !== Status.REJECTED) {
      throw new HttpException(409, 'Cannot delete aproved courses');
    }
    return this.course.delete({ where: { id } });
  } 
  //////////////////////////////////////////////////////////////////////////////////////////////
  // get all changes between same version 
  public async getAllChangesCompare(courseId: number): Promise<any> {
    const oldVersion = await this.course.findUnique({
      where: { id: courseId },
      include: {
        lecture: {
          include: {
            question: {
              include: { answer: true, UserQuestionAnswer: true },
            },
            userLecture: true,
          },
        },
        userCourses: true,
      },
    });
  
    // If no course is found
    if (!oldVersion) {
      throw new Error('Course not found for the given ID');
    }
  
    // Function to compare timestamps
    const compareTimestamps = (createdAt: Date, updatedAt: Date) => {
      if (updatedAt > createdAt) return 'Updated';
      if (updatedAt === createdAt) return 'Not Updated';
      return 'Invalid';
    };
  
    // Deduplicate an array based on a key
    const deduplicate = <T>(array: T[], key: keyof T): T[] =>
      array.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t[key] === item[key])
      );
  
    // Process lectures with deduplication
    const lecturesWithStatus = oldVersion.lecture.map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      slug: lecture.slug,
      description: lecture.description,
      video_path: lecture.video_path,
      course_id: lecture.course_id,
      pre_note: lecture.pre_note,
      next_note: lecture.next_note,
      order: lecture.order,
      picture: lecture.picture,
      created_at: lecture.created_at,
      updated_at: lecture.updated_at,
      status: compareTimestamps(lecture.created_at, lecture.updated_at),
      // Process and deduplicate questions
      questions: deduplicate(
        lecture.question.map((question) => ({
          id: question.id,
          description: question.description,
          lecture_id: question.lecture_id,
          sequence: question.sequence,
          score: question.score,
          created_at: question.created_at,
          updated_at: question.updated_at,
          answers: deduplicate(
            question.answer.map((answer) => ({
              id: answer.id,
              description: answer.description,
              is_correct: answer.is_correct,
              question_id: answer.question_id,
              created_at: answer.created_at,
              updated_at: answer.updated_at,
              status: compareTimestamps(answer.created_at, answer.updated_at),
            })),
            'id'
          ),
        })),
        'id'
      ),
    }));
  
    return {
      lectures: lecturesWithStatus,
      message: 'This is differences',
    };
  }
  ///////////////////////////////////////////////////
  // functions of versioning for student 
  //////////////////////////////////////////////////
  public findAllPageWithLatestVersion = async ({ offset, limit }: { offset: number; limit: number }): Promise<Course[]> => {
    const latestVersions = await this.prisma.course.groupBy({
      by: ['parent_version_id'],
      _max: { version: true },
    });
  
    const latestVersionConditions = latestVersions.map(group => ({
      parent_version_id: group.parent_version_id,
      version: group._max?.version,
    }));
  
    return this.prisma.course.findMany({
      where: {
        OR: latestVersionConditions,
      },
      skip: offset,
      take: limit,
      include: {
        teacher: true, // Include related teacher data if needed
      },
    });
  };
  public countLatestVersionCourses = async (): Promise<number> => {
    const latestVersions = await this.prisma.course.groupBy({
      by: ['parent_version_id'],
      _max: { version: true },
    });
  
    return latestVersions.length;
  };
// create new version with whats_new version 
async createNewVersionWithWhatsNew(
  id: number,
  prevcourseversion: Course,
  user_id: string,
  slug: string,
  whats_new?: string // Added optional parameter
): Promise<Course> {
  // Check if the user is the teacher of the course
  if (prevcourseversion.teacher_user_id !== user_id) {
    throw new HttpException(403, 'Forbidden');
  }

  // Get the latest version by selecting the highest version number
  const latestVersion = await this.course.aggregate({
    where: { parent_version_id: id, publish_status: 'APPROVED' },
    _max: { version: true },
  });

  // Determine the new version number
  let version = 1; // Default to version 1 if no previous versions exist
  if (latestVersion._max.version !== null) {
    version = latestVersion._max.version + 0.1;
  }

  // Destructure necessary fields from the previous course version
  const {
    description,
    difficulty,
    language,
    logo,
    name,
    tag,
    title,
    id: parent_version_id,
    teacher_user_id,
  } = prevcourseversion;

  // Create the new version with the `whats_new` field included
  const newVersion = await this.course.create({
    data: {
      description,
      difficulty,
      language,
      logo,
      name,
      tag,
      title,
      version,
      publish_status: 'DRAFT',
      parent_version_id,
      slug,
      teacher_user_id,
      whats_new, // Include the `whats_new` field
    },
  });

  return newVersion;
}
  // Retrieve the original course and all its versions
public async getAllVersions(courseId: number): Promise<Course[]> {
  const allVersions = await this.course.findMany({
    where: {
      OR: [
        { id: courseId }, // Original course
        { parent_version_id: courseId } // Versions of the course
      ]
    },
    include: {
      lecture: {
        include: {
          question: {
            include: {
              answer: true
            }
          },
          userLecture: true
        }
      },
      userCourses: true,
      UserQuestionAnswer: true,
      courseStatusHistoryForAdmin: true,
      teacher: true, // Fetch teacher (User model) details
    },
    orderBy: {
      version: 'asc', // Optional: Sort by version number
    }
  });

  return allVersions;
}
// create version for course with is version 
async createNewVersionWithIsVersion(
  id: number,
  prevcourseversion: Course,
  user_id: string, slug:string,whats_new?:string
): Promise<Course> {

  // Check if the user is the teacher of the course
  if (prevcourseversion.teacher_user_id !== user_id) {
    throw new HttpException(403, 'Forbidden');
  }

  // Get the latest version by selecting the highest version number
  const latestVersion = await this.course.aggregate({
    where: { parent_version_id: id ,publish_status:'APPROVED'},
    _max: { version: true },
  });

  // Determine the new version number
  let version = 1; // Default to version 1 if no previous versions exist
  if (latestVersion._max.version !== null) {
    version = latestVersion._max.version + 0.1;
  }
  
  const description=prevcourseversion.description;
 const difficulty=prevcourseversion.difficulty;
const language=prevcourseversion.language;
 const logo=prevcourseversion.logo;
 const name=prevcourseversion.name;
 const tag=prevcourseversion.tag;
 const title=prevcourseversion.title;
const parent_version_id= prevcourseversion.id;
const teacher_user_id=prevcourseversion.teacher_user_id;
  // Create the new version
  const newVersion = await this.course.create({
    data: {
      description,difficulty,language,logo,name,tag,title,
      version,
      publish_status: 'DRAFT',
      parent_version_id,
      slug,
      teacher_user_id,
      whats_new:whats_new,
      isVersion:true,
    }
  });

  return newVersion;
}
////////////////////////////////////////////////////////////////////////////////////////
  // compare all data between old and new verions without id and slug 
  // public async getAllChangesByIdWithoutSlud(courseId: number): Promise<any> {
  //   const oldVersion = await this.course.findUnique({
  //     where: { id: courseId },
  //     include: {
  //       lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
  //       userCourses: true,
  //       UserQuestionAnswer: true
  //     }
  //   });
  
  //   const pendingVersion = await this.course.findFirst({
  //     where: { parent_version_id: courseId, publish_status: 'PENDING_REVIEW' },
  //     include: {
  //       lecture: { include: { question: { include: { answer: true } }, userLecture: true } },
  //       userCourses: true,
  //       UserQuestionAnswer: true
  //   });
  
  //   if (!oldVersion || !pendingVersion) return { message: "No data found" };
  
  //   function compareEntities(oldData: any[], newData: any[]) {
  //     // Identify added items (new data that doesn't exist in the old data)
  //     const added = newData.filter(n => !oldData.some(o => o.id === n.id));
  
  //     // Identify deleted items (old data that doesn't exist in the new data)
  //     const deleted = oldData.filter(o => !newData.some(n => n.id === o.id));
  
  //     // Identify updated items (items that exist in both but have changes)
  //     const updated = newData
  //       .filter(n => oldData.some(o => o.id === n.id))
  //       .map(n => {
  //         const old = oldData.find(o => o.id === n.id);
  //         const differences = Object.keys(n).reduce((diff, key) => {
  //           // Compare fields excluding 'id', 'slug', 'course_id', and any other static fields
  //           if (key !== "id" && key !== "slug" && key !== "course_id" && n[key] !== old[key]) {
  //             diff[key] = { old: old[key], new: n[key] };
  //           }
  //           return diff;
  //         }, {});
  
  //         // Check if the 'updated_at' field has changed
  //         if (n.updated_at && n.updated_at !== old.updated_at) {
  //           differences['updated_at'] = { old: old.updated_at, new: n.updated_at };
  //         }
  
  //         // Return the updated entity only if there are actual changes
  //         return Object.keys(differences).length ? { id: n.id, differences } : null;
  //       })
  //       .filter(Boolean);  // Remove nulls from updated
  
  //     return { added, deleted, updated };
  //   }
  
  //   return {
  //     lectures: compareEntities(oldVersion.lecture, pendingVersion.lecture),
  //     questions: compareEntities(
  //       oldVersion.lecture.flatMap(l => l.question),
  //       pendingVersion.lecture.flatMap(l => l.question)
  //     ),
  //     answers: compareEntities(
  //       oldVersion.lecture.flatMap(l => l.question.flatMap(q => q.answer)),
  //       pendingVersion.lecture.flatMap(l => l.question.flatMap(q => q.answer))
  //     ),
  //     userCourses: compareEntities(oldVersion.userCourses, pendingVersion.userCourses),
  //     userAnswers: compareEntities(oldVersion.UserQuestionAnswer, pendingVersion.UserQuestionAnswer),
  //     message: "This is differences"
  //   };
  // } 
}
