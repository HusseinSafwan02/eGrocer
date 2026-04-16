const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All cart routes require authentication (FR-301)
router.use(authenticate);

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });
  }

  return cart;
}

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    res.json(cartResponse(cart));
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items — add item
router.post('/items', async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId), isActive: true },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // FR-305: prevent adding out-of-stock items
    if (product.stockQty === 0) {
      return res.status(400).json({ error: 'This item is out of stock' });
    }

    const cart = await getOrCreateCart(req.user.userId);

    const existingItem = cart.items.find((i) => i.productId === parseInt(productId));
    const newQty = existingItem ? existingItem.quantity + parseInt(quantity) : parseInt(quantity);

    // Prevent ordering more than available stock
    if (newQty > product.stockQty) {
      return res.status(400).json({ error: `Only ${product.stockQty} units available` });
    }

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: parseInt(productId) } },
      update: { quantity: newQty },
      create: { cartId: cart.id, productId: parseInt(productId), quantity: parseInt(quantity) },
    });

    const updated = await getOrCreateCart(req.user.userId);
    res.json(cartResponse(updated));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/items/:productId — update quantity
router.patch('/items/:productId', async (req, res, next) => {
  const { quantity } = req.body;
  const productId = parseInt(req.params.productId);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (quantity > product.stockQty) {
      return res.status(400).json({ error: `Only ${product.stockQty} units available` });
    }

    const cart = await getOrCreateCart(req.user.userId);

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: parseInt(quantity) },
    });

    const updated = await getOrCreateCart(req.user.userId);
    res.json(cartResponse(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:productId — remove item
router.delete('/items/:productId', async (req, res, next) => {
  const productId = parseInt(req.params.productId);

  try {
    const cart = await getOrCreateCart(req.user.userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    const updated = await getOrCreateCart(req.user.userId);
    res.json(cartResponse(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ items: [], total: 0, itemCount: 0 });
  } catch (err) {
    next(err);
  }
});

function cartResponse(cart) {
  const items = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    brand: item.product.brand,
    image: item.product.images[0] || null,
    unitPrice: parseFloat(item.product.price),
    quantity: item.quantity,
    subtotal: parseFloat(item.product.price) * item.quantity,
    stockQty: item.product.stockQty,
  }));

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, total: parseFloat(total.toFixed(2)), itemCount };
}

module.exports = router;
