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

module.exports = { cartResponse };
