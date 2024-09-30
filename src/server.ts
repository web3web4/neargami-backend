import { App } from '@/app';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { CourseRoute } from './routes/course.route';
import { AuthRoute } from './routes/auth.route';

ValidateEnv();

const app = new App([new UserRoute(), new CourseRoute(), new AuthRoute()]);

app.listen();
