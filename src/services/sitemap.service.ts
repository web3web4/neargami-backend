import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class SitemapService {
  private prisma = new PrismaClient();

  private readonly baseUrl = 'https://www.neargami.com';

  /**
   * Generate complete sitemap XML for the website
   */
  public async generateSitemap(): Promise<string> {
    const urls: string[] = [];

    // Add only the main site URL
    urls.push(this.createUrlEntry(this.baseUrl, new Date(), 'daily', '1.0'));

    // Add course details URLs
    const courseDetailsUrls = await this.getCourseDetailsUrls();
    urls.push(...courseDetailsUrls);

    // Add quiz URLs
    const quizUrls = await this.getQuizUrls();
    urls.push(...quizUrls);

    return this.wrapInSitemapXml(urls);
  }

  /**
   * Get all approved courses URLs
   */
  private async getCoursesUrls(): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        publish_status: 'APPROVED',
        slug: { not: null },
      },
      select: {
        slug: true,
        updated_at: true,
        title: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return courses.map(course => this.createUrlEntry(`${this.baseUrl}/course/${course.slug}`, course.updated_at, 'weekly', '0.8'));
  }

  /**
   * Get all lectures URLs from approved courses
   */
  private async getLecturesUrls(): Promise<string[]> {
    const lectures = await this.prisma.lecture.findMany({
      where: {
        course: {
          publish_status: 'APPROVED',
        },
        slug: { not: null },
      },
      select: {
        slug: true,
        updated_at: true,
        course: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return lectures.map(lecture =>
      this.createUrlEntry(`${this.baseUrl}/course/${lecture.course.slug}/lecture/${lecture.slug}`, lecture.updated_at, 'weekly', '0.7'),
    );
  }

  /**
   * Get all teachers URLs
   */
  private async getTeachersUrls(): Promise<string[]> {
    const teachers = await this.prisma.user.findMany({
      where: {
        Course: {
          some: {
            publish_status: 'APPROVED',
          },
        },
        blocked: false,
        username: { not: null },
      },
      select: {
        username: true,
        updated_at: true,
        slug: true,
      },
      distinct: ['id'],
      orderBy: {
        updated_at: 'desc',
      },
    });

    return teachers.map(teacher => {
      const identifier = teacher.slug || teacher.username;
      return this.createUrlEntry(`${this.baseUrl}/teacher/${identifier}`, teacher.updated_at, 'weekly', '0.6');
    });
  }

  /**
   * Get course versions URLs
   */
  private async getCourseVersionsUrls(): Promise<string[]> {
    const courseVersions = await this.prisma.course.findMany({
      where: {
        publish_status: 'APPROVED',
        parent_version_id: { not: null },
        slug: { not: null },
      },
      select: {
        slug: true,
        updated_at: true,
        version: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return courseVersions.map(version =>
      this.createUrlEntry(`${this.baseUrl}/course/${version.slug}/version/${version.version}`, version.updated_at, 'monthly', '0.5'),
    );
  }

  /**
   * Get URLs for course details pages
   */
  private async getCourseDetailsUrls(): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        publish_status: 'APPROVED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        updated_at: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return courses.map(course => {
      // Use the slug for the URL or create a slug from the title if not available
      const urlSlug = course.slug || this.createSlugFromTitle(course.title);
      return this.createUrlEntry(`${this.baseUrl}/course-details/${urlSlug}`, course.updated_at, 'weekly', '0.8');
    });
  }

  /**
   * Get URLs for quiz pages
   */
  private async getQuizUrls(): Promise<string[]> {
    // First, get lectures with their course IDs
    const lectures = await this.prisma.lecture.findMany({
      where: {
        course: {
          publish_status: 'APPROVED',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        updated_at: true,
        course_id: true,
        course: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return lectures.map(lecture => {
      // Create a slug from the lecture title if not available
      const titleSlug = lecture.slug || this.createSlugFromTitle(lecture.title);
      return this.createUrlEntry(`${this.baseUrl}/quiz/${lecture.course.id}/${lecture.id}/${titleSlug}`, lecture.updated_at, 'weekly', '0.7');
    });
  }

  /**
   * Create a slug from a title (helper function)
   */
  private createSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  }

  /**
   * Create a single URL entry for sitemap
   */
  private createUrlEntry(url: string, lastmod: Date, changefreq: string, priority: string): string {
    return `
  <url>
    <loc>${this.escapeXml(url)}</loc>
    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Wrap URLs in sitemap XML structure
   */
  private wrapInSitemapXml(urls: string[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });
  }

  /**
   * Get sitemap statistics
   */
  public async getSitemapStats(): Promise<{
    totalUrls: number;
    courses: number;
    quizzes: number;
    lastGenerated: Date;
  }> {
    const [coursesCount, lecturesCount] = await Promise.all([
      this.prisma.course.count({
        where: {
          publish_status: 'APPROVED',
          slug: { not: null },
        },
      }),
      this.prisma.lecture.count({
        where: {
          course: {
            publish_status: 'APPROVED',
          },
          slug: { not: null },
        },
      }),
    ]);

    const staticPages = 1; // Only home page
    const totalUrls = staticPages + coursesCount + lecturesCount;

    return {
      totalUrls,
      courses: coursesCount,
      quizzes: lecturesCount,
      lastGenerated: new Date(),
    };
  }

  /**
   * Generate robots.txt content
   */
  public generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml`;
  }

  /**
   * Get all questions URLs (if needed for detailed sitemap)
   */
  private async getQuestionsUrls(): Promise<string[]> {
    const questions = await this.prisma.question.findMany({
      where: {
        lecture: {
          course: {
            publish_status: 'APPROVED',
          },
        },
      },
      select: {
        id: true,
        updated_at: true,
        lecture: {
          select: {
            slug: true,
            course: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return questions.map(question =>
      this.createUrlEntry(
        `${this.baseUrl}/course/${question.lecture.course.slug}/lecture/${question.lecture.slug}/question/${question.id}`,
        question.updated_at,
        'monthly',
        '0.4',
      ),
    );
  }
}
