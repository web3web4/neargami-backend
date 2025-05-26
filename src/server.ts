import { App } from './app';
import { UserRoute } from './routes/users.routes';
import { ValidateEnv } from './utils/validateEnv';
import { CourseRoute } from './routes/course.routes';
import { lectureRoute } from './routes/lecture.routes';
import { QuestionRoute } from './routes/question.routes';
import { UserCoursesMapping } from './routes/user-courses-mapping.routes';
import { UserLecturesMapping } from './routes/user-lecture-mapping.routes';
import { AuthRoute } from './routes/auth.routes';
import { ClaimsRoute } from './routes/claims.routes';
import { LogsRoute } from './routes/log.routes';
import { SitemapRoute } from './routes/sitemap.routes';
ValidateEnv();

const app = new App([
  new UserRoute(),
  new CourseRoute(),
  new lectureRoute(),
  new QuestionRoute(),
  new UserCoursesMapping(),
  new UserLecturesMapping(),
  new AuthRoute(),
  new ClaimsRoute(),
  new LogsRoute(),
  new SitemapRoute(),
]);

app.listen();

export default app.getServer();
