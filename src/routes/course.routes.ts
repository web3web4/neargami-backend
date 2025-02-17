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
    this.router.get('/courses/changes/:id', this.courseController.getAllChangesBetweenVersions);
    this.router.get('/courses/users-start/:id', this.courseController.findUsersStartingCourse);

    this.router.get('/courses/slug', this.courseController.makeAllCoursesHaveSlug);
    this.router.get('/courses/page', this.courseController.findAllCoursesPage);
    this.router.get('/courses/search', this.courseController.search);
    this.router.get('/courses', this.courseController.findAllCourses);
    this.router.get('/courses/auth/all', AuthMiddleware, this.courseController.findAllCoursesWithAuth);
    this.router.get('/courses/teacher/:id', this.courseController.findTeacherCourses);
    this.router.get('/courses/status/:id', this.courseController.findCoursesByStatus);
    this.router.get('/courses/tag/:tag', this.courseController.findCoursesByTag);
    this.router.get('/courses/search/:phras', this.courseController.findCoursesByTextSearch);
    this.router.get('/courses/full-search/:phras', this.courseController.findCoursesBySubTextSearch);
    this.router.post('/courses', AuthMiddleware, ValidationMiddleware(CreateCourseDto, false, false, true), this.courseController.createCourse);
    this.router.get('/courses/id/:id', AuthMiddleware, this.courseController.findCourseById);
    this.router.put('/courses/:id', AuthMiddleware, ValidationMiddleware(UpdateCourseDto, false, true, true), this.courseController.updateCourse);
    this.router.put('/courses/status/:id', AuthMiddleware, this.courseController.updateCourseStatus);
    this.router.put('/courses/pending/:id', AuthMiddleware, this.courseController.changeCourseStatusFromDraftToPending);
    this.router.put('/courses/statusLog/:id', AuthMiddleware, this.courseController.makeLogStatusForAdminUser);
    this.router.delete('/courses/:id', AuthMiddleware, this.courseController.deleteCourse);
    this.router.get('/courses/keywords', this.courseController.getKeywords);
    this.router.get('/courses/:slug', this.courseController.findCourseBySlug);
    this.router.post('/courses/newVersion/:id',AuthMiddleware,this.courseController.createNewCourseVersion)
  }
}
