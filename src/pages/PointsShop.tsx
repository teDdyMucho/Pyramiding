import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function PointsShop() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  const categories = [
    { name: 'Groceries', icon: '🛒' },
    { name: 'Tools', icon: '🔧' },
    { name: 'Appliances', icon: '🏠' },
    { name: 'Gadgets', icon: '📱' },
  ]

  const products = [
    { id: 1, name: 'Rice 25kg', category: 'Groceries', price: 1200, points: 120, image: '🌾' },
    { id: 2, name: 'Power Drill Set', category: 'Tools', price: 3500, points: 350, image: '🔨' },
    { id: 3, name: 'Air Fryer', category: 'Appliances', price: 4500, points: 450, image: '🍳' },
    { id: 4, name: 'Smartphone', category: 'Gadgets', price: 15000, points: 1500, image: '📱' },
    { id: 5, name: 'Cooking Oil 5L', category: 'Groceries', price: 800, points: 80, image: '🛢️' },
    { id: 6, name: 'Toolbox Set', category: 'Tools', price: 2500, points: 250, image: '🧰' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-dark">Points Shop</h1>
              <p className="text-medium font-medium">Super low prices on quality goods</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark hover:bg-accent/5 transition-all"
          >
            Sign out
          </button>
        </div>

        {/* Search Bar */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6 mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-accent/20 focus:border-accent focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.name}
              className="rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-bold text-dark">{category.name}</div>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-accent/20 bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <div className="mb-2">
                  <span className="text-xs font-semibold text-medium bg-accent/20 px-2 py-1 rounded-lg">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-dark">₱{product.price.toLocaleString()}</div>
                    <div className="text-sm text-medium">or {product.points} points</div>
                  </div>
                </div>
                <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-white hover:from-amber-600 hover:to-amber-700 transition-all">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder Notice */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-center">
          <div className="text-sm font-semibold text-blue-700">
            🚧 This is a placeholder page. Full shopping functionality coming soon!
          </div>
        </div>
      </div>
    </div>
  )
}

export default PointsShop
