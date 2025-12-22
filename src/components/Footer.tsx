function Footer() {
  return (
    <footer className="bg-dark text-light">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Own Corp</h3>
            <p className="text-light/80 text-sm">
              Build an invite-based community and track your network growth with a clean, simple dashboard.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-light/80 hover:text-light">Home</a></li>
              <li><a href="/tree" className="text-light/80 hover:text-light">Network</a></li>
              <li><a href="/dashboard" className="text-light/80 hover:text-light">Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-light/80 hover:text-light">Help Center</a></li>
              <li><a href="#" className="text-light/80 hover:text-light">Contact Us</a></li>
              <li><a href="#" className="text-light/80 hover:text-light">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-light/20 text-center">
          <p className="text-light/70 text-sm">
            © 2024 Own Corp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
