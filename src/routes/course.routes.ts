import { CourseController } from '../controllers/course.controller';
import { CreateCourseDto, UpdateCourseDto } from '../dtos/course.dto';
import { Routes } from '../interfaces/routes.interface';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { Router } from 'express';
import { Service, Container } from 'typedi';

@Service() // Register this as a service to ensure DI works across the app
export class CourseRoute implements Routes {
  public router = Router();
  public courseController = Container.get(CourseController);

  constructor() {
    this.initializeRoutes();
  }
  //
  //
  //
  private initializeRoutes() {
    this.router.get('/courses/testEmail', this.courseController.testEmail);
    this.router.post('/courses', AuthMiddleware, ValidationMiddleware(CreateCourseDto, false, false, true), this.courseController.createCourse);
    this.router.get('/courses/students-started', AuthMiddleware, this.courseController.findStudentStartedCoursesExceptMine);
    this.router.get('/courses/slug', this.courseController.makeAllCoursesHaveSlug);
    this.router.get('/courses/page', this.courseController.findAllCoursesPage);
    this.router.get('/courses/search', this.courseController.search);
    this.router.get('/courses/teacher/:id', this.courseController.findTeacherCourses);
    this.router.get('/courses/teacher/username/:username', this.courseController.findTeacherCoursesByUserName);
    this.router.get('/courses/status/:id', this.courseController.findCoursesByStatus);
    this.router.get('/courses/tag/:tag', this.courseController.findCoursesByTag);
    this.router.get('/courses/full-search/:phras', this.courseController.findCoursesBySubTextSearch);
    this.router.put('/courses/:id', AuthMiddleware, ValidationMiddleware(UpdateCourseDto, false, true, true), this.courseController.updateCourse);
    this.router.put('/courses/status/:id', AuthMiddleware, this.courseController.updateCourseStatus);
    this.router.delete('/courses/:id', AuthMiddleware, this.courseController.deleteCourse);
    this.router.get('/courses/keywords', this.courseController.getKeywords);
    this.router.get('/courses/:slug', this.courseController.findCourseBySlug);
    this.router.put(
      '/courses/isdraft/:id',
      AuthMiddleware,
      ValidationMiddleware(UpdateCourseDto, false, true, true),
      this.courseController.updateCourseIfWasDraft,
    );
    this.router.put('/courses/draft/:id', AuthMiddleware, this.courseController.setCourseToDraft);
    this.router.put('/courses/changeStatus/all/:id', AuthMiddleware, this.courseController.changeStatusAll);
    this.router.get('/courses/status/:id/dashboard', this.courseController.findCoursesStatusDashboard);

    /////////////////////////////////////////////////////////////////
    // the versioning api for student
    ////////////////////////////////////////////////////////////////
    this.router.get('/courses/lastVersion/page', this.courseController.findAllCoursesPageForStudent);
    this.router.post('/courses/newversion/withwhatsnew/:id', AuthMiddleware, this.courseController.createNewCourseVersionWithWhatsNew);
    this.router.get('/courses/versions/:id', AuthMiddleware, this.courseController.getAllCourseVersions);
    this.router.get('/courses/student/name/completed/:name', this.courseController.findCompletedCoursesByStudentName); // find all courses was finished by student (name)
  }
}
