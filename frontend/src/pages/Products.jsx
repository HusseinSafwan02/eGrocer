import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  // Find current category breadcrumb
  const findCategory = (cats, id) => {
    for (const cat of cats) {
      if (cat.id === parseInt(id)) return cat;
      if (cat.children) {
        for (const sub of cat.children) {
          if (sub.id === parseInt(id)) return sub;
          if (sub.children) {
            for (const sub2 of sub.children) {
              if (sub2.id === parseInt(id)) return sub2;
            }
          }
        }
      }
    }
    return null;
  };

  const currentCategory = categoryId ? findCategory(categories, categoryId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Departments</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setFilter('categoryId', '')}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                    !categoryId ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => setFilter('categoryId', dept.id)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                      categoryId === String(dept.id) ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {dept.name}
                  </button>
                  {(categoryId === String(dept.id) || dept.children?.some((c) => categoryId === String(c.id))) &&
                    dept.children?.length > 0 && (
                      <ul className="ml-3 mt-1 space-y-1">
                        {dept.children.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => setFilter('categoryId', sub.id)}
                              className={`w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${
                                categoryId === String(sub.id) ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {sub.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {search ? `Search results for "${search}"` : currentCategory ? currentCategory.name : 'All Products'}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {pagination.total ?? 0} product{pagination.total !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Mobile category filter */}
            <select
              className="lg:hidden input-field w-auto"
              value={categoryId}
              onChange={(e) => setFilter('categoryId', e.target.value)}
            >
              <option value="">All Departments</option>
              {categories.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {(search || categoryId) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {search && (
                <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
                  Search: {search}
                  <button onClick={() => setFilter('search', '')} className="ml-1 hover:text-primary-900">×</button>
                </span>
              )}
              {categoryId && currentCategory && (
                <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
                  {currentCategory.name}
                  <button onClick={() => setFilter('categoryId', '')} className="ml-1 hover:text-primary-900">×</button>
                </span>
              )}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl">🔍</span>
              <h3 className="text-lg font-semibold text-gray-700 mt-4">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try a different search or browse our departments.</p>
              <Link to="/products" className="btn-primary mt-4 inline-block">Browse All Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(pagination.pages)].map((_, i) => {
                const p = i + 1;
                const next = new URLSearchParams(searchParams);
                next.set('page', p);
                return (
                  <button
                    key={p}
                    onClick={() => setSearchParams(next)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
