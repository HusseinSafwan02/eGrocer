const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/orders — customer's own orders (FR-405)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        payment: true,
      },
      orderBy: { orderDate: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — place an order from current cart
router.post('/', authenticate, async (req, res, next) => {
  const { fulfillment, address, pickupTime, paymentMethod = 'CARD' } = req.body;

  if (!fulfillment || !['HOME_DELIVERY', 'WAREHOUSE_PICKUP'].includes(fulfillment)) {
    return res.status(400).json({ error: 'Invalid fulfillment type' });
  }

  if (fulfillment === 'HOME_DELIVERY' && !address) {
    return res.status(400).json({ error: 'Delivery address required' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stockQty < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.product.name}". Only ${item.product.stockQty} available.`,
        });
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    const txnRef = 'TXN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    // Create order, items, and payment in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.userId,
          fulfillment,
          address: fulfillment === 'HOME_DELIVERY' ? address : null,
          pickupTime: pickupTime ? new Date(pickupTime) : null,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: totalAmount,
              status: 'COMPLETED',
              txnRef,
              paidAt: new Date(),
            },
          },
        },
        include: { items: true, payment: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: { select: { name: true, brand: true, images: true } } } },
        payment: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Customers can only see their own orders (NFR-306)
    if (req.user.role !== 'ADMINISTRATOR' && order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — admin only (FR-406)
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['PROCESSING', 'DISPATCHED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
