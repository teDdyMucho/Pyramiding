import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark via-medium to-dark text-light py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-light/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-accent/20 rounded-full text-accent text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
                Enterprise Business Solutions
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                Own Corp
                <span className="block text-accent text-3xl md:text-4xl font-light mt-4 tracking-wide">
                  Business Management Platform
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-16 text-light/90 max-w-4xl mx-auto leading-relaxed font-light">
              Streamline your business operations with our comprehensive management platform. 
              Connect teams, track performance, and scale your organization with intelligent tools designed for modern enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/register" 
                className="group bg-accent text-dark px-12 py-6 rounded-2xl font-bold text-xl hover:bg-accent/90 transition-all duration-500 shadow-2xl hover:shadow-accent/25 transform hover:-translate-y-2 hover:scale-105"
              >
                <span className="flex items-center">
                  Start Free Trial
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-light/30 text-light px-12 py-6 rounded-2xl font-semibold text-xl hover:bg-light/10 hover:border-light transition-all duration-300 backdrop-blur-sm"
              >
                Enterprise Login
              </Link>
            </div>
            <div className="mt-16 flex items-center justify-center space-x-8 text-light/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">500+</div>
                <div className="text-sm">Companies</div>
              </div>
              <div className="w-px h-8 bg-light/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">50K+</div>
                <div className="text-sm">Users</div>
              </div>
              <div className="w-px h-8 bg-light/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-32 bg-gradient-to-b from-light to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(135,192,205,0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-semibold mb-6">
              Enterprise Solutions
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-dark mb-8 leading-tight">
              Transform Your Business
            </h2>
            <p className="text-xl text-medium max-w-3xl mx-auto leading-relaxed">
              Comprehensive business management tools designed to optimize operations, enhance productivity, and drive sustainable growth across your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <div className="group bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-accent/10 hover:border-accent/30 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-dark to-medium rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-6">Business Intelligence</h3>
              <p className="text-medium text-lg leading-relaxed mb-6">
                Advanced analytics and reporting tools to make data-driven decisions and optimize your business performance.
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-accent/10 hover:border-accent/30 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-dark to-medium rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-6">Team Management</h3>
              <p className="text-medium text-lg leading-relaxed mb-6">
                Streamline team collaboration, project management, and resource allocation with intelligent workflow automation.
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-accent/10 hover:border-accent/30 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-dark to-medium rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-6">Performance Optimization</h3>
              <p className="text-medium text-lg leading-relaxed mb-6">
                Monitor key metrics, identify bottlenecks, and implement strategic improvements to maximize operational efficiency.
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="py-32 bg-gradient-to-br from-medium via-dark to-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(135,192,205,0.1),transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 bg-light/10 rounded-full text-light text-sm font-semibold mb-6">
              Advanced Capabilities
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-light mb-8 leading-tight">
              Enterprise-Grade Platform
            </h2>
            <p className="text-xl text-light/80 max-w-3xl mx-auto leading-relaxed">
              Powerful tools and integrations designed to scale with your business needs and drive measurable results across all departments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="space-y-8">
              <div className="group bg-light/5 backdrop-blur-sm p-8 rounded-3xl border border-light/10 hover:border-accent/50 transition-all duration-500">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-light rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-light mb-4">Security & Compliance</h3>
                    <p className="text-light/70 text-lg leading-relaxed">
                      Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and advanced access controls to protect your business data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-light/5 backdrop-blur-sm p-8 rounded-3xl border border-light/10 hover:border-accent/50 transition-all duration-500">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-light rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-light mb-4">API Integration</h3>
                    <p className="text-light/70 text-lg leading-relaxed">
                      Seamlessly connect with your existing tools through our comprehensive REST API and pre-built integrations with popular business platforms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-light/5 backdrop-blur-sm p-8 rounded-3xl border border-light/10 hover:border-accent/50 transition-all duration-500">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-light rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-light mb-4">Advanced Analytics</h3>
                    <p className="text-light/70 text-lg leading-relaxed">
                      Real-time business intelligence with customizable dashboards, predictive analytics, and automated reporting for data-driven decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-light/10 to-accent/10 rounded-3xl p-12 border border-light/20 backdrop-blur-sm">
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-light mb-4">Trusted by Industry Leaders</h3>
                    <p className="text-light/70 text-lg">Join thousands of companies already transforming their operations</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-light/5 rounded-2xl border border-light/10">
                      <div className="text-3xl font-bold text-accent mb-2">250%</div>
                      <div className="text-light/70 text-sm">Productivity Increase</div>
                    </div>
                    <div className="text-center p-6 bg-light/5 rounded-2xl border border-light/10">
                      <div className="text-3xl font-bold text-accent mb-2">40%</div>
                      <div className="text-light/70 text-sm">Cost Reduction</div>
                    </div>
                    <div className="text-center p-6 bg-light/5 rounded-2xl border border-light/10">
                      <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                      <div className="text-light/70 text-sm">Expert Support</div>
                    </div>
                    <div className="text-center p-6 bg-light/5 rounded-2xl border border-light/10">
                      <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
                      <div className="text-light/70 text-sm">Service Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent via-accent to-light py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-dark/5 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-dark/10 rounded-full text-dark text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-dark rounded-full mr-2 animate-pulse"></span>
              Transform Your Business Today
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-dark leading-tight">
              Ready to Scale?
            </h2>
            <p className="text-xl mb-16 text-dark/80 max-w-4xl mx-auto leading-relaxed">
              Join industry leaders who trust Own Corp to streamline operations, boost productivity, and drive sustainable growth. 
              Start your transformation with our comprehensive business management platform.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center mb-16">
            <Link 
              to="/register" 
              className="group bg-dark text-light px-16 py-8 rounded-3xl font-bold text-2xl hover:bg-dark/90 transition-all duration-500 shadow-2xl hover:shadow-dark/25 transform hover:-translate-y-3 hover:scale-105"
            >
              <span className="flex items-center">
                Start Free Trial
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link 
              to="/login" 
              className="border-3 border-dark/30 text-dark px-16 py-8 rounded-3xl font-semibold text-2xl hover:bg-dark/10 hover:border-dark transition-all duration-300 backdrop-blur-sm"
            >
              Schedule Demo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-dark/5 rounded-2xl backdrop-blur-sm border border-dark/10">
              <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-dark mb-2">30-Day Free Trial</h3>
              <p className="text-dark/70 text-sm">No credit card required</p>
            </div>
            <div className="text-center p-6 bg-dark/5 rounded-2xl backdrop-blur-sm border border-dark/10">
              <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark mb-2">24/7 Support</h3>
              <p className="text-dark/70 text-sm">Expert assistance anytime</p>
            </div>
            <div className="text-center p-6 bg-dark/5 rounded-2xl backdrop-blur-sm border border-dark/10">
              <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark mb-2">Enterprise Security</h3>
              <p className="text-dark/70 text-sm">SOC 2 compliant platform</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
