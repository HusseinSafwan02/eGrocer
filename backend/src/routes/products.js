const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { collectCategoryIds } = require('../utils/category.utils');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products — list with optional filters and search
// Query params: search, categoryId, page, limit, inStock
router.get('/', async (req, res, next) => {
  try {
    const { search, categoryId, page = 1, limit = 20, inStock } = req.query;

    const where = { isActive: true };

    if (inStock === 'true') {
      where.stockQty = { gt: 0 };
    }

    if (categoryId) {
      // Include products from sub-categories too
      const catId = parseInt(categoryId);
      const category = await prisma.category.findUnique({
        where: { id: catId },
        include: { children: { include: { children: true } } },
      });

      if (category) {
        const allCatIds = collectCategoryIds(category);
        where.categoryId = { in: allCatIds };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { include: { parent: { include: { parent: true } } } } },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id), isActive: true },
      include: { category: { include: { parent: { include: { parent: true } } } } },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Simple recommendations: other products in same category (FR-801)
    const recommendations = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        stockQty: { gt: 0 }, // FR-802: no out-of-stock in recommendations
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ product, recommendations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
