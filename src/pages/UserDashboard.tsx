import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { encryptRef } from '../utils/encryption'

type AppRole = 'users' | 'leaders' | 'admin'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: AppRole
}

function UserDashboard() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const user = useMemo(() => {
    const raw = localStorage.getItem('app_user')
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }, [])

  const totalConnections = 12
  const activeMembers = 7
  const baseUrl = (import.meta.env?.VITE_PUBLIC_APP_URL) || (typeof window !== 'undefined' ? window.location.origin : '')
  const inviteLink = user ? `${baseUrl}/register?ref=${encryptRef(user.phone_number)}` : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/8 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-dark/3 to-transparent rounded-full blur-2xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/60 flex items-center justify-center shadow-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-dark">
                  Welcome, {user.first_name} {user.last_name}
                </h1>
                <p className="text-medium font-medium flex items-center gap-2 mt-1">
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                  Network Dashboard
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="group inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <path d="M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* Enhanced stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Total Connections</div>
                <div className="text-3xl font-bold text-dark">{totalConnections}</div>
                <div className="text-xs text-green-600 font-semibold mt-1">+2 this week</div>
              </div>
            </div>
          </div>
          
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Active Members</div>
                <div className="text-3xl font-bold text-dark">{activeMembers}</div>
                <div className="text-xs text-blue-600 font-semibold mt-1">{Math.round((activeMembers/totalConnections)*100)}% active rate</div>
              </div>
            </div>
          </div>
          
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                <div className="text-sm font-bold text-dark">Invite Link</div>
              </div>
              <div className="flex gap-2">
                <input
                  value={inviteLink}
                  readOnly
                  className="flex-1 rounded-xl border-2 border-accent/20 bg-white/80 px-3 py-2 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={
                    copied
                      ? 'group/btn rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all duration-300 shadow-lg'
                      : 'group/btn rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg'
                  }
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Copied
                    </span>
                  ) : (
                    <svg className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              {copied && (
                <div className="self-center text-[10px] font-bold text-emerald-600">Copied!</div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced action section */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-dark to-medium flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold text-dark">Network Overview</div>
                  <div className="text-sm text-medium font-medium">Explore your connections and relationships</div>
                </div>
              </div>
              <div className="text-sm text-medium leading-relaxed">
                View detailed network structure, connection analytics, and member activity insights.
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/network"
                className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-dark to-medium px-8 py-4 text-lg font-bold text-light hover:from-medium hover:to-dark transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <svg className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                </svg>
                View Network
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard






