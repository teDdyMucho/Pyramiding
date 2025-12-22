import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Brand area - empty for now */}
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-medium hover:text-dark px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/tree" className="text-medium hover:text-dark px-3 py-2 rounded-md text-sm font-medium">
              Network
            </Link>
            <Link to="/dashboard" className="text-medium hover:text-dark px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-medium hover:text-dark px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-dark hover:bg-medium text-light px-4 py-2 rounded-md text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
