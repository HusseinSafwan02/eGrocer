import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products?limit=8&inStock=true'),
    ])
      .then(([catRes, prodRes]) => {
        setDepartments(catRes.data);
        setFeaturedProducts(prodRes.data.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const departmentEmojis = {
    'Produce': '🥦',
    'Dairy & Eggs': '🥛',
    'Beverages': '🧃',
    'Snacks & Confectionery': '🍫',
    'Frozen Foods': '🧊',
    'Bakery': '🍞',
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Fresh Groceries, <span className="text-primary-200">Delivered to You</span>
          </h1>
          <p className="text-primary-200 text-lg mb-8">
            Shop from Singapore's freshest selection — fruits, dairy, snacks and more.
          </p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto rounded-xl overflow-hidden shadow-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for bananas, milk, chips..."
              className="flex-1 px-5 py-4 text-gray-800 focus:outline-none text-base"
            />
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-400 px-6 py-4 font-semibold transition-colors"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <Link to="/products?search=fruits" className="text-primary-200 hover:text-white transition-colors">🍎 Fruits</Link>
            <Link to="/products?search=milk" className="text-primary-200 hover:text-white transition-colors">🥛 Dairy</Link>
            <Link to="/products?search=bread" className="text-primary-200 hover:text-white transition-colors">🍞 Bakery</Link>
            <Link to="/products?search=chips" className="text-primary-200 hover:text-white transition-colors">🍟 Snacks</Link>
            <Link to="/products?search=juice" className="text-primary-200 hover:text-white transition-colors">🧃 Juices</Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Shop by Department */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Department</h2>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {departments.map((dept) => (
                <Link
                  key={dept.id}
                  to={`/products?categoryId=${dept.id}`}
                  className="card flex flex-col items-center p-4 hover:shadow-md hover:border-primary-200 transition-all text-center group"
                >
                  <span className="text-3xl mb-2">{departmentEmojis[dept.name] || '🛒'}</span>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700 leading-tight">
                    {dept.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Value propositions */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery to your door across Singapore' },
            { icon: '✅', title: 'Fresh Guaranteed', desc: 'All products freshness-checked before dispatch' },
            { icon: '🔒', title: 'Secure Payment', desc: 'Pay safely with card or PayNow' },
          ].map((item) => (
            <div key={item.title} className="card p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
