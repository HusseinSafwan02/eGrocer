const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categories — full 3-level tree
router.get('/', async (req, res, next) => {
  try {
    const departments = await prisma.category.findMany({
      where: { level: 1, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        parent: true,
        children: { where: { isActive: true } },
      },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
