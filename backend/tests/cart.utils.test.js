const { cartResponse } = require('../src/utils/cart.utils');

// Helper to build a mock cart the same shape Prisma returns
function makeCart(items) {
  return {
    items: items.map(({ productId, name, brand, price, images, stockQty, quantity }) => ({
      productId,
      quantity,
      product: { name, brand, price: price.toString(), images, stockQty },
    })),
  };
}

// ─────────────────────────────────────────────
// cartResponse
// ─────────────────────────────────────────────
describe('cartResponse', () => {
  test('returns empty totals for an empty cart', () => {
    const result = cartResponse(makeCart([]));
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.itemCount).toBe(0);
  });

  test('correctly calculates subtotal for a single item', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Apple Juice', brand: 'Marigold', price: 3.50, images: [], stockQty: 10, quantity: 2 },
    ]));
    expect(result.items[0].subtotal).toBe(7.00);
  });

  test('correctly calculates cart total across multiple items', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Apple Juice',   brand: 'Marigold', price: 3.50, images: [], stockQty: 10, quantity: 2 },
      { productId: 2, name: 'Full Cream Milk', brand: 'Meadow Fresh', price: 3.80, images: [], stockQty: 20, quantity: 1 },
    ]));
    // 3.50 * 2 + 3.80 * 1 = 10.80
    expect(result.total).toBe(10.80);
  });

  test('correctly calculates itemCount', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Banana', brand: 'Fresh Farms', price: 2.50, images: [], stockQty: 50, quantity: 3 },
      { productId: 2, name: 'Milk',   brand: 'Meadow',      price: 3.80, images: [], stockQty: 20, quantity: 2 },
    ]));
    expect(result.itemCount).toBe(5);
  });

  test('rounds total to 2 decimal places', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Item', brand: 'Brand', price: 1.005, images: [], stockQty: 5, quantity: 3 },
    ]));
    const decimals = result.total.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  test('uses the first image from the images array', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Item', brand: 'Brand', price: 1.00, images: ['img1.jpg', 'img2.jpg'], stockQty: 5, quantity: 1 },
    ]));
    expect(result.items[0].image).toBe('img1.jpg');
  });

  test('sets image to null when images array is empty', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Item', brand: 'Brand', price: 1.00, images: [], stockQty: 5, quantity: 1 },
    ]));
    expect(result.items[0].image).toBeNull();
  });

  test('exposes unitPrice and stockQty on each item', () => {
    const result = cartResponse(makeCart([
      { productId: 1, name: 'Item', brand: 'Brand', price: 4.90, images: [], stockQty: 8, quantity: 1 },
    ]));
    expect(result.items[0].unitPrice).toBe(4.90);
    expect(result.items[0].stockQty).toBe(8);
  });
});
