import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const location = useLocation()
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    project: '',
    amount: '',
    yearToPay: ''
  })

  const [projects, setProjects] = useState<Array<{project_cy: string, amount: string[], year_to_pay: string[]}>>([])  
  const [availableAmounts, setAvailableAmounts] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successModalMessage, setSuccessModalMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (!ref) return

    setFormData((prev) => {
      if (prev.inviteCode?.trim()) return prev
      return { ...prev, inviteCode: ref }
    })
  }, [location.search])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('Project')
          .select('project_cy, amount, year_to_pay')
        
        if (error) {
          console.error('Error fetching projects:', error)
          return
        }
        
        if (data && Array.isArray(data)) {
          setProjects(data)
          console.log('Projects loaded:', data)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
      }
    }
    fetchProjects()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'confirmPassword') {
      confirmPasswordRef.current?.setCustomValidity('')
      setPasswordMismatch(false)
    }

    if (name === 'userId') {
      const sanitized = value.replace(/[^a-zA-Z0-9]/g, '')
      setFormData({
        ...formData,
        [name]: sanitized
      })
      return
    }

    if (name === 'project') {
      const selectedProject = projects.find(p => p.project_cy === value)
      if (selectedProject) {
        setAvailableAmounts(selectedProject.amount)
        setAvailableYears(selectedProject.year_to_pay)
        setFormData({
          ...formData,
          project: value,
          amount: '',
          yearToPay: ''
        })
        return
      }
    }

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', formData)

    // Validate User ID
    if (!formData.userId.trim()) {
      setErrorModalMessage('User ID is required.')
      setShowErrorModal(true)
      return
    }

    if (formData.userId.length < 6) {
      setErrorModalMessage('User ID must be at least 6 characters.')
      setShowErrorModal(true)
      return
    }

    // Validate phone number - must be at least 11 digits
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
    if (phoneDigits.length < 11) {
      setErrorModalMessage('Phone number must be at least 11 digits.')
      setShowErrorModal(true)
      return
    }

    // Validate password - must be at least 8 characters and contain at least one number
    if (formData.password.length < 8) {
      setErrorModalMessage('Password must be at least 8 characters long.')
      setShowErrorModal(true)
      return
    }

    if (!/\d/.test(formData.password)) {
      setErrorModalMessage('Password must contain at least one number.')
      setShowErrorModal(true)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true)
      confirmPasswordRef.current?.setCustomValidity('Passwords do not match')
      confirmPasswordRef.current?.reportValidity()
      return
    }

    setIsSubmitting(true)
    console.log('Sending webhook request...')
    try {
      const response = await fetch('https://primary-production-6722.up.railway.app/webhook/894b45ce-f8cc-4af4-8fa4-74ba472b08f4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          inviteCode: formData.inviteCode,
          project: formData.project,
          amount: formData.amount,
          yearToPay: formData.yearToPay,
        }),
      })

      console.log('Response received:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.status === 'fail' && data.msg) {
        setErrorModalMessage(data.msg)
        setShowErrorModal(true)
      } else if (data.status === 'success' && data.msg) {
        setSuccessModalMessage(data.msg)
        setShowSuccessModal(true)
      } else {
        console.log('Registration completed with unknown status')
      }
    } catch (err) {
      console.error('Error during webhook call:', err)
      setErrorModalMessage('An error occurred. Please try again.')
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
      console.log('Form submission complete')
    }
  }

  return (
    <div className="min-h-screen bg-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark">Registration Error</h3>
            </div>
            <p className="text-medium mb-6 text-base">{errorModalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-base font-bold text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark">Registration Successful</h3>
            </div>
            <p className="text-medium mb-6 text-base">{successModalMessage}</p>
            <Link
              to="/"
              className="block w-full text-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-base font-bold text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      )}

      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-accent/20 px-4 py-2 text-sm font-semibold text-dark shadow-lg hover:bg-white hover:border-accent/40 transition-all duration-200"
        >
          <span aria-hidden="true">â†</span>
          Back to Home
        </Link>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold text-dark">
          Create your account
        </h2>
        <p className="mt-2 text-center text-lg text-medium">
          Join Own Corp and access our business management platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm py-12 px-8 shadow-2xl rounded-3xl border border-accent/20">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-medium mb-2">
                User ID Login
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                required
                minLength={6}
                value={formData.userId}
                onChange={handleChange}
                placeholder="Letters and numbers only (min 6 characters)"
                className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-medium mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-medium mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-medium mb-2">
                Phone number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Min 11 digits"
                className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters with number"
                  minLength={8}
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-medium hover:text-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.585 10.585A2 2 0 0012 14a2 2 0 001.414-.586" />
                      <path d="M9.88 4.243A10.94 10.94 0 0112 4c7 0 10 8 10 8a19.66 19.66 0 01-2.156 3.156" />
                      <path d="M6.228 6.228C3.5 8.5 2 12 2 12s3 8 10 8a10.94 10.94 0 004.243-.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-medium mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-medium hover:text-dark transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.585 10.585A2 2 0 0012 14a2 2 0 001.414-.586" />
                      <path d="M9.88 4.243A10.94 10.94 0 0112 4c7 0 10 8 10 8a19.66 19.66 0 01-2.156 3.156" />
                      <path d="M6.228 6.228C3.5 8.5 2 12 2 12s3 8 10 8a10.94 10.94 0 004.243-.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <div className="mt-2 text-sm font-semibold text-red-700">
                  Passwords do not match.
                </div>
              )}
            </div>

            <div>
              <label htmlFor="inviteCode" className="block text-sm font-semibold text-medium mb-2">
                Invite code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                required
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="Enter invite code"
                className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl placeholder-medium/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
              />
            </div>

            <div className="border-t border-accent/20 pt-6 mt-6">
              <h3 className="text-lg font-bold text-dark mb-4">Project Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="project" className="block text-sm font-semibold text-medium mb-2">
                    Project
                  </label>
                  <select
                    id="project"
                    name="project"
                    required
                    value={formData.project}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50"
                  >
                    <option value="">Select a project</option>
                    {projects.map((proj, idx) => (
                      <option key={idx} value={proj.project_cy}>
                        {proj.project_cy}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-medium mb-2">
                    Amount
                  </label>
                  <select
                    id="amount"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    disabled={!formData.project}
                    className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select amount</option>
                    {availableAmounts.map((amt, idx) => (
                      <option key={idx} value={amt}>
                        ₱{parseInt(amt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="yearToPay" className="block text-sm font-semibold text-medium mb-2">
                    Year to pay
                  </label>
                  <select
                    id="yearToPay"
                    name="yearToPay"
                    required
                    value={formData.yearToPay}
                    onChange={handleChange}
                    disabled={!formData.project}
                    className="appearance-none block w-full px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select payment period</option>
                    {availableYears.map((year, idx) => (
                      <option key={idx} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-light bg-dark hover:bg-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 transform hover:-translate-y-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="text-center">
              <span className="text-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-dark hover:text-accent transition-colors duration-200">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register


