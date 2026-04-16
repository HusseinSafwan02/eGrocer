const { collectCategoryIds } = require('../src/utils/category.utils');

// ─────────────────────────────────────────────
// collectCategoryIds
// ─────────────────────────────────────────────
describe('collectCategoryIds', () => {
  test('returns the id of a single category with no children', () => {
    const category = { id: 1 };
    expect(collectCategoryIds(category)).toEqual([1]);
  });

  test('returns own id plus direct children ids', () => {
    const category = {
      id: 1,
      children: [{ id: 2 }, { id: 3 }],
    };
    expect(collectCategoryIds(category)).toEqual([1, 2, 3]);
  });

  test('handles 3-level hierarchy (Department → Category → Sub-category)', () => {
    const department = {
      id: 1,                          // Produce
      children: [
        {
          id: 2,                      // Fruits
          children: [
            { id: 4 },               // Tropical Fruits
            { id: 5 },               // Berries
          ],
        },
        {
          id: 3,                      // Vegetables
          children: [
            { id: 6 },               // Leafy Greens
          ],
        },
      ],
    };
    const ids = collectCategoryIds(department);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(ids).toContain(4);
    expect(ids).toContain(5);
    expect(ids).toContain(6);
    expect(ids).toHaveLength(6);
  });

  test('handles a category with an empty children array', () => {
    const category = { id: 10, children: [] };
    expect(collectCategoryIds(category)).toEqual([10]);
  });

  test('does not include duplicate ids', () => {
    const category = {
      id: 1,
      children: [{ id: 2 }, { id: 3 }],
    };
    const ids = collectCategoryIds(category);
    const unique = [...new Set(ids)];
    expect(ids).toEqual(unique);
  });
});
