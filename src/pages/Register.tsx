import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const navigate = useNavigate()
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'confirmPassword') {
      confirmPasswordRef.current?.setCustomValidity('')
      setPasswordMismatch(false)
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.inviteCode.trim()) {
      setErrorMessage('Invite code is required.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true)
      confirmPasswordRef.current?.setCustomValidity('Passwords do not match')
      confirmPasswordRef.current?.reportValidity()
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      // Enforce max 10 uses per invite code (best-effort client-side; server must also enforce)
      const invite = formData.inviteCode.trim()
      if (invite) {
        const { count, error: countError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('invite_code', invite)

        if (!countError && (count ?? 0) >= 10) {
          setErrorMessage('Invite code has reached the maximum of 10 registrations.')
          return
        }
      }

      const { data, error } = await supabase.rpc('register_user', {
        p_first_name: formData.firstName,
        p_last_name: formData.lastName,
        p_phone_number: formData.phoneNumber,
        p_password: formData.password,
        p_invite_code: formData.inviteCode || null,
      })

      if (error) throw error

      if (!data) {
        throw new Error('Registration failed. No data returned.')
      }

      setSuccessMessage('Account created successfully. You can now sign in.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err: any) {
      const code = err?.code as string | undefined
      const message = (err?.message ?? 'Registration failed.') as string

      if (/maximum of 10 registrations/i.test(message) || /limit/i.test(message)) {
        setErrorMessage('Invite code has reached the maximum of 10 registrations.')
        return
      }

      if (code === '23505' || /duplicate/i.test(message)) {
        setErrorMessage('Invalid register: this phone number is already registered with the same name.')
      } else {
        setErrorMessage(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {successMessage}
              </div>
            )}
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


