const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { hashPassword, generateSalt } = require('../utils/auth.utils');

const router = express.Router();
const prisma = new PrismaClient();

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30m' } // FR-107: 30 minutes inactivity
  );
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
      .matches(/[0-9]/).withMessage('Password needs a digit')
      .matches(/[^A-Za-z0-9]/).withMessage('Password needs a special character'),
    body('name').trim().notEmpty().withMessage('Full name required'),
    body('phone').optional().trim(),
    body('address').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone, address } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const salt = generateSalt();
      const hash = hashPassword(password, salt);

      const user = await prisma.user.create({
        data: { email, name, phone, address, passwordHash: hash, passwordSalt: salt, role: 'CUSTOMER' },
      });

      const token = issueToken(user);
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check account lock (FR-105)
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(403).json({
          error: 'Account temporarily locked due to too many failed login attempts. Check your email for an unlock link.',
        });
      }

      const hash = hashPassword(password, user.passwordSalt);
      if (hash !== user.passwordHash) {
        const newFailCount = user.failedLoginAttempts + 1;
        const updateData = { failedLoginAttempts: newFailCount };

        if (newFailCount >= 5) {
          // Lock for 1 hour
          updateData.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
          updateData.failedLoginAttempts = 0;
          await prisma.user.update({ where: { id: user.id }, data: updateData });
          return res.status(403).json({
            error: 'Account locked after 5 failed attempts. Check your email for an unlock link.',
          });
        }

        await prisma.user.update({ where: { id: user.id }, data: updateData });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Successful login — reset failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });

      const token = issueToken(user);
      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me — validate token and return user info
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, phone: true, address: true, locale: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh — issue a new token (sliding session)
router.post('/refresh', authenticate, (req, res) => {
  const token = jwt.sign(
    { userId: req.user.userId, email: req.user.email, role: req.user.role, name: req.user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
  res.json({ token });
});

module.exports = router;
