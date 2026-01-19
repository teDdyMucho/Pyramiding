import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Investment() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [years, setYears] = useState('5')

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  const properties = [
    {
      id: 1,
      title: 'Boracay Beach Resort',
      location: 'Boracay, Aklan, Philippines',
      type: 'Resort Property',
      image: '🏖️',
      description: 'Luxury beachfront resort with white sand beach access',
      minInvestment: 50000,
    },
    {
      id: 2,
      title: 'Palawan Island Villa',
      location: 'El Nido, Palawan, Philippines',
      type: 'Resort Property',
      image: '🏝️',
      description: 'Private island villa with stunning lagoon views',
      minInvestment: 100000,
    },
    {
      id: 3,
      title: 'Cebu Mountain Resort',
      location: 'Busay, Cebu, Philippines',
      type: 'Resort Property',
      image: '⛰️',
      description: 'Mountain resort with panoramic city and sea views',
      minInvestment: 75000,
    },
    {
      id: 4,
      title: 'Life Insurance Plan',
      location: 'Nationwide, Philippines',
      type: 'Insurance',
      image: '🛡️',
      description: 'Comprehensive life insurance with investment returns',
      minInvestment: 10000,
    },
    {
      id: 5,
      title: 'Health Insurance Plus',
      location: 'Nationwide, Philippines',
      type: 'Insurance',
      image: '🏥',
      description: 'Health insurance with savings and investment component',
      minInvestment: 15000,
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % properties.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + properties.length) % properties.length)
  }

  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Investment request submitted! (Placeholder)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-dark">Investment Opportunities</h1>
              <p className="text-medium font-medium">Resort properties & insurance in the Philippines</p>
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

        {/* Property Slideshow */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Featured Properties</h2>
          
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-12 mb-6">
              <div className="text-center">
                <div className="text-8xl mb-4">{properties[currentSlide].image}</div>
                <h3 className="text-3xl font-bold text-dark mb-2">{properties[currentSlide].title}</h3>
                <div className="flex items-center justify-center gap-2 text-medium mb-4">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {properties[currentSlide].location}
                </div>
                <div className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold mb-4">
                  {properties[currentSlide].type}
                </div>
                <p className="text-lg text-dark mb-6">{properties[currentSlide].description}</p>
                <div className="text-2xl font-bold text-dark">
                  Minimum Investment: ₱{properties[currentSlide].minInvestment.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Slideshow Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevSlide}
                className="h-12 w-12 rounded-full bg-white border-2 border-accent/20 flex items-center justify-center hover:bg-accent/10 transition-all shadow-lg"
              >
                <svg className="h-6 w-6 text-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex gap-2">
                {properties.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 w-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-blue-600 w-8' : 'bg-accent/30'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="h-12 w-12 rounded-full bg-white border-2 border-accent/20 flex items-center justify-center hover:bg-accent/10 transition-all shadow-lg"
              >
                <svg className="h-6 w-6 text-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Investment Form */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">Investment Calculator</h2>
                <p className="text-sm text-medium">Plan your investment</p>
              </div>
            </div>

            <form onSubmit={handleInvestmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Select Project</label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                >
                  <option value="">Choose a project...</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.title}>
                      {property.title} - {property.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Investment Amount (₱)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Payment Term (Years)</label>
                <select
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                >
                  <option value="1">1 Year</option>
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                </select>
              </div>

              {amount && years && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="text-sm font-semibold text-blue-700 mb-2">Estimated Monthly Payment</div>
                  <div className="text-3xl font-bold text-blue-900">
                    ₱{(parseFloat(amount) / (parseInt(years) * 12)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">per month for {years} years</div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base font-bold text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Submit Investment Request
              </button>
            </form>
          </div>

          {/* Current Investment */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <div className="text-lg font-semibold">Current Investment</div>
              </div>
              <div className="text-5xl font-bold mb-2">₱226</div>
              <div className="text-sm opacity-90">Total invested amount</div>
            </div>

            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Investment Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-dark">High Returns</div>
                    <div className="text-sm text-medium">Competitive ROI on all investments</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-dark">Flexible Terms</div>
                    <div className="text-sm text-medium">Choose payment plans that fit your budget</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-dark">Secure Investment</div>
                    <div className="text-sm text-medium">All properties are verified and insured</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Notice */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-center">
          <div className="text-sm font-semibold text-blue-700">
            🚧 This is a placeholder page. Full investment functionality coming soon!
          </div>
        </div>
      </div>
    </div>
  )
}

export default Investment
