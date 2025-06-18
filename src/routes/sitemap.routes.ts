import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { SitemapController } from '../controllers/sitemap.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { Service, Container } from 'typedi';

@Service()
export class SitemapRoute implements Routes {
  public router = Router();
  public sitemapController = Container.get(SitemapController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes
    this.router.get('/sitemap.xml', this.sitemapController.getSitemap);
    this.router.get('/robots.txt', this.sitemapController.getRobotsTxt);

    // Admin routes (require authentication)
    this.router.get('/sitemap/stats', AuthMiddleware, this.sitemapController.getSitemapStats);
    this.router.post('/sitemap/regenerate', AuthMiddleware, this.sitemapController.regenerateSitemap);
  }
}
