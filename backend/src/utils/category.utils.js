function collectCategoryIds(category) {
  const ids = [category.id];
  if (category.children) {
    for (const child of category.children) {
      ids.push(...collectCategoryIds(child));
    }
  }
  return ids;
}

module.exports = { collectCategoryIds };
