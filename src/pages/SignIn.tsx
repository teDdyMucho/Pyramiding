import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
}

function SignIn() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const redirectByRole = (role: string) => {
    if (role === 'users') navigate('/dashboard/user')
    else if (role === 'leaders') navigate('/dashboard/leader')
    else if (role === 'admin') navigate('/admin/approvals')
    else navigate('/pending-approval')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.rpc('verify_login', {
        p_phone_number: formData.identifier,
        p_password: formData.password,
      })

      if (error) throw error

      const user = (Array.isArray(data) ? data[0] : data) as AuthUser | null

      if (!user) {
        setErrorMessage('Invalid credentials.')
        return
      }

      localStorage.setItem('app_user', JSON.stringify(user))
      redirectByRole(user.role)
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Sign in failed.')
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
          <span aria-hidden="true">←</span>
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold text-dark">Sign in</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm py-12 px-8 shadow-2xl rounded-3xl border border-accent/20">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-medium mb-2">
                Phone number or email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
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
                  autoComplete="current-password"
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-light bg-dark hover:bg-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 transform hover:-translate-y-1"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="text-center">
              <span className="text-medium">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-dark hover:text-accent transition-colors duration-200">
                  Create Account
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
