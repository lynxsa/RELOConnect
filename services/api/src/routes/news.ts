import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.string().min(10),
  imageUrl: z.string().url().optional(),
  source: z.string().min(1),
  author: z.string().optional(),
  publishedAt: z.string(),
  category: z.enum(['LOGISTICS', 'RELOCATION', 'INDUSTRY', 'TECHNOLOGY']),
  tags: z.array(z.string()).optional(),
});

const updateNewsSchema = createNewsSchema.partial();

// Get all news articles (with filters and pagination)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      tags,
      source,
      search,
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {};

    // Apply filters
    if (category) {
      whereClause.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereClause.tags = {
        hasEvery: tagArray
      };
    }

    if (source) {
      whereClause.source = {
        contains: source as string,
        mode: 'insensitive'
      };
    }

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          source: true,
          author: true,
          publishedAt: true,
          category: true,
          tags: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.newsArticle.count({
        where: whereClause
      })
    ]);

    return res.json({
      articles,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get news articles error:', error);
    return res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Get featured/trending articles
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get recent articles from the last 7 days, sorted by publish date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const featuredArticles = await prisma.newsArticle.findMany({
      where: {
        publishedAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        source: true,
        author: true,
        publishedAt: true,
        category: true,
        tags: true,
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    return res.json({ articles: featuredArticles });
  } catch (error) {
    console.error('Get featured articles error:', error);
    return res.status(500).json({ error: 'Failed to fetch featured articles' });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!['LOGISTICS', 'RELOCATION', 'INDUSTRY', 'TECHNOLOGY'].includes(category.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where: {
          category: category.toUpperCase() as any
        },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          source: true,
          author: true,
          publishedAt: true,
          category: true,
          tags: true,
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.newsArticle.count({
        where: {
          category: category.toUpperCase() as any
        }
      })
    ]);

    return res.json({
      articles,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get articles by category error:', error);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Search articles
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20, category } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            has: query
          }
        }
      ]
    };

    if (category) {
      whereClause.category = category;
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          source: true,
          author: true,
          publishedAt: true,
          category: true,
          tags: true,
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.newsArticle.count({
        where: whereClause
      })
    ]);

    return res.json({
      articles,
      query,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Search articles error:', error);
    return res.status(500).json({ error: 'Failed to search articles' });
  }
});

// Get related articles
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const article = await prisma.newsArticle.findUnique({
      where: { id },
      select: {
        category: true,
        tags: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Find related articles by same category or shared tags
    const relatedArticles = await prisma.newsArticle.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current article
          {
            OR: [
              { category: article.category },
              {
                tags: {
                  hasSome: article.tags
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        source: true,
        author: true,
        publishedAt: true,
        category: true,
        tags: true,
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    return res.json({ articles: relatedArticles });
  } catch (error) {
    console.error('Get related articles error:', error);
    return res.status(500).json({ error: 'Failed to fetch related articles' });
  }
});

// Get news statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalArticles,
      categoryCounts,
      recentArticles,
      topSources
    ] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsArticle.groupBy({
        by: ['category'],
        _count: {
          category: true
        }
      }),
      prisma.newsArticle.count({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.newsArticle.groupBy({
        by: ['source'],
        _count: {
          source: true
        },
        orderBy: {
          _count: {
            source: 'desc'
          }
        },
        take: 5
      })
    ]);

    return res.json({
      stats: {
        totalArticles,
        recentArticles,
        categoryCounts: categoryCounts.map(item => ({
          category: item.category,
          count: item._count.category
        })),
        topSources: topSources.map(item => ({
          source: item.source,
          count: item._count.source
        }))
      }
    });
  } catch (error) {
    console.error('Get news stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch news statistics' });
  }
});

// Create news article (Admin only - would need admin middleware)
router.post('/', async (req, res) => {
  try {
    const validatedData = createNewsSchema.parse(req.body);

    const article = await prisma.newsArticle.create({
      data: {
        ...validatedData,
        publishedAt: new Date(validatedData.publishedAt),
        tags: validatedData.tags || [],
      }
    });

    return res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create article error:', error);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update news article (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateNewsSchema.parse(req.body);

    let updateData: any = { ...validatedData };
    if (validatedData.publishedAt) {
      updateData.publishedAt = new Date(validatedData.publishedAt);
    }

    const article = await prisma.newsArticle.update({
      where: { id },
      data: updateData
    });

    return res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Update article error:', error);
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete news article (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.newsArticle.delete({
      where: { id }
    });

    return res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
