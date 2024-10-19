import { App } from '@/app';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { CourseRoute } from './routes/course.routes';
import { lectureRoute } from './routes/lecture.routes';
import { QuestionRoute } from './routes/question.routes';
import { AnswerRoute } from './routes/answer.routes';
import { UserCoursesMapping } from './routes/user-courses-mapping.routes';
import { UserLecturesMapping } from './routes/user-lecture-mapping.routes';
import { AuthRoute } from './routes/auth.route';
ValidateEnv();

const app = new App([
  new UserRoute(),
  new CourseRoute(),
  new lectureRoute(),
  new QuestionRoute(),
  new AnswerRoute(),
  new UserCoursesMapping(),
  new UserLecturesMapping(),
  new AuthRoute(),
]);

app.listen();
