import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
  created_at?: string
}

const isApprovedRole = (role: string) => {
  return role === 'users' || role === 'leaders' || role === 'admin'
}

const roleHome = (role: string) => {
  if (role === 'users') return '/dashboard/user'
  if (role === 'leaders') return '/dashboard/leader'
  if (role === 'admin') return '/admin/approvals'
  return '/pending-approval'
}

function PendingApproval() {
  const navigate = useNavigate()

  const storedUser = useMemo(() => {
    const raw = localStorage.getItem('app_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }, [])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submittedDate = storedUser?.created_at
    ? new Date(storedUser.created_at).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'â€”'

  const refreshStatus = async ({ silent }: { silent?: boolean } = {}) => {
    if (!storedUser) return

    if (!silent) {
      setIsRefreshing(true)
      setErrorMessage(null)
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone_number, role, created_at')
        .eq('id', storedUser.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setErrorMessage('Account not found.')
        return
      }

      localStorage.setItem('app_user', JSON.stringify(data))

      if (isApprovedRole(data.role)) {
        navigate(roleHome(data.role), { replace: true })
        return
      }
    } catch (err: any) {
      if (!silent) setErrorMessage(err?.message ?? 'Unable to refresh status.')
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!storedUser) return

    let isMounted = true

    const bootstrap = async () => {
      await refreshStatus({ silent: true })
    }

    bootstrap()

    const channel = supabase
      .channel(`pending-approval:${storedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${storedUser.id}`,
        },
        (payload: any) => {
          if (!isMounted) return
          const nextRole = (payload.new as any)?.role as string | undefined
          if (nextRole && isApprovedRole(nextRole)) {
            localStorage.setItem('app_user', JSON.stringify({ ...storedUser, role: nextRole }))
            navigate(roleHome(nextRole), { replace: true })
            return
          }

          refreshStatus({ silent: true })
        }
      )
      .subscribe()

    const poll = window.setInterval(() => {
      refreshStatus({ silent: true })
    }, 8000)

    return () => {
      isMounted = false
      window.clearInterval(poll)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUser?.id])

  const signOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  if (!storedUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-dark/5 to-transparent rounded-full blur-2xl"></div>
      
      <div className="w-full max-w-lg relative">
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          {/* Enhanced header with gradient and animation */}
          <div className="relative px-8 py-8 bg-gradient-to-r from-orange-50 via-orange-25 to-white border-b border-orange-100/50">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent"></div>
            <div className="relative flex items-start gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200/60 flex items-center justify-center shadow-lg">
                  <svg className="h-7 w-7 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                {/* Animated pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 animate-ping opacity-20"></div>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-dark mb-1">Account Under Review</div>
                <div className="text-sm text-orange-700 font-medium">Your registration is being processed</div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                  Pending Approval
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-25 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {errorMessage}
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="text-base text-dark leading-relaxed font-medium mb-4">
                Thank you for your registration with our enterprise platform.
              </div>
              <div className="text-sm text-medium leading-relaxed">
                Your account credentials have been successfully submitted and are currently under administrative review. Our team will evaluate your application and assign appropriate access permissions once the verification process is complete.
              </div>
            </div>

            {/* Enhanced details section */}
            <div className="mb-8 rounded-2xl border border-accent/20 bg-gradient-to-br from-light/60 to-white/80 p-6 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-bold text-dark">Application Details</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="text-sm text-medium font-medium">Full Name</div>
                  <div className="text-sm font-bold text-dark bg-white/60 px-3 py-1 rounded-lg">{storedUser.first_name} {storedUser.last_name}</div>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="text-sm text-medium font-medium">Contact Number</div>
                  <div className="text-sm font-bold text-dark bg-white/60 px-3 py-1 rounded-lg">{storedUser.phone_number}</div>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="text-sm text-medium font-medium">Application Status</div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm font-bold">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Under Review
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="text-sm text-medium font-medium">Submission Date</div>
                  <div className="text-sm font-semibold text-dark">{submittedDate}</div>
                </div>
              </div>
            </div>

            {/* Enhanced action buttons */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => refreshStatus()}
                disabled={isRefreshing}
                className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-dark to-medium px-6 py-4 text-sm font-bold text-light hover:from-medium hover:to-dark transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                <svg className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
              <a
                href="mailto:support@owncorp.local"
                className="group inline-flex items-center justify-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-4 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <svg className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Contact Support
              </a>
            </div>

            {/* Enhanced footer navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-accent/10">
              <Link to="/" className="group inline-flex items-center text-sm font-semibold text-medium hover:text-dark transition-colors duration-200">
                <svg className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="group inline-flex items-center text-sm font-semibold text-medium hover:text-red-600 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <path d="M21 12H9" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval


