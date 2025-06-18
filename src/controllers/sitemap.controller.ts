import { NextFunction, Request, Response } from 'express';
import { Container, Service } from 'typedi';
import { SitemapService } from '../services/sitemap.service';

@Service()
export class SitemapController {
  public sitemapService = Container.get(SitemapService);

  /**
   * Generate and return sitemap XML
   */
  public getSitemap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sitemapXml = await this.sitemapService.generateSitemap();

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.status(200).send(sitemapXml);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sitemap statistics
   */
  public getSitemapStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.sitemapService.getSitemapStats();
      res.status(200).json({ data: stats, message: 'Sitemap statistics retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate and return robots.txt
   */
  public getRobotsTxt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const robotsTxt = this.sitemapService.generateRobotsTxt();

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.status(200).send(robotsTxt);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Force regenerate sitemap (admin only)
   */
  public regenerateSitemap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sitemapXml = await this.sitemapService.generateSitemap();
      const stats = await this.sitemapService.getSitemapStats();

      res.status(200).json({
        data: {
          stats,
          message: 'Sitemap regenerated successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
