import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type AppRole = 'users' | 'leaders' | 'admin'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: AppRole
}

type Member = {
  id: string
  name: string
  phone: string
  connections?: Member[]
}

function NetworkView() {
  const user = useMemo(() => {
    const raw = localStorage.getItem('app_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }, [])

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const data: Member[] = useMemo(() => {
    return [
      {
        id: 'm1',
        name: 'Alex Santos',
        phone: '09XXXXXXXXX',
        connections: [
          { id: 'm1a', name: 'Jessa Cruz', phone: '09XXXXXXXXX' },
          { id: 'm1b', name: 'Mark Dela Rosa', phone: '09XXXXXXXXX' },
        ],
      },
      {
        id: 'm2',
        name: 'Kim Reyes',
        phone: '09XXXXXXXXX',
        connections: [
          { id: 'm2a', name: 'Paolo Garcia', phone: '09XXXXXXXXX' },
        ],
      },
      {
        id: 'm3',
        name: 'Jamie Lim',
        phone: '09XXXXXXXXX',
      },
    ]
  }, [])

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!user) return null

  const dashboardPath = user.role === 'leaders' ? '/dashboard/leader' : user.role === 'users' ? '/dashboard/user' : '/dashboard/admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/8 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-dark/3 to-transparent rounded-full blur-2xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 border border-green-200/60 flex items-center justify-center shadow-lg">
                <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-dark">Network Overview</h1>
                <p className="text-medium font-medium flex items-center gap-2 mt-1">
                  <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Connection structure and analytics
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={dashboardPath}
              className="group inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Enhanced user info section */}
        <div className="mb-10">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center font-bold text-accent text-2xl shadow-lg">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-medium mb-1">Network Owner</div>
                  <div className="text-2xl font-bold text-dark">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-medium font-medium mt-1">{user.phone_number}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-25 p-4 text-center">
                  <div className="text-sm font-bold text-blue-700 mb-1">Direct Connections</div>
                  <div className="text-3xl font-bold text-dark">{data.length}</div>
                </div>
                <div className="rounded-2xl border-2 border-green-200/60 bg-gradient-to-br from-green-50 to-green-25 p-4 text-center">
                  <div className="text-sm font-bold text-green-700 mb-1">Total Network</div>
                  <div className="text-3xl font-bold text-dark">{data.reduce((acc, m) => acc + (m.connections?.length || 0), data.length)}</div>
                </div>
                <div className="rounded-2xl border-2 border-purple-200/60 bg-gradient-to-br from-purple-50 to-purple-25 p-4 text-center">
                  <div className="text-sm font-bold text-purple-700 mb-1">Active Rate</div>
                  <div className="text-3xl font-bold text-dark">87%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced network visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {data.map((member) => {
            const isOpen = !!expanded[member.id]
            const hasConnections = !!member.connections?.length
            const connectionCount = member.connections?.length || 0

            return (
              <div key={member.id} className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Member header */}
                <div className="bg-gradient-to-r from-light/40 to-white/60 border-b border-accent/10 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center font-bold text-accent text-lg shadow-lg">
                        {member.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-dark">{member.name}</div>
                        <div className="text-sm text-medium font-medium">{member.phone}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="text-xs text-green-600 font-semibold">Active member</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-medium mb-1">Connections</div>
                      <div className="text-2xl font-bold text-dark">{connectionCount}</div>
                    </div>
                  </div>
                </div>

                {/* Member content */}
                <div className="p-6">
                  {hasConnections ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-dark">Network Members ({connectionCount})</div>
                        <button
                          type="button"
                          onClick={() => toggle(member.id)}
                          className="group/btn inline-flex items-center rounded-xl border-2 border-accent/30 bg-white/60 px-4 py-2 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/50 transition-all duration-200"
                        >
                          <svg className={`h-4 w-4 mr-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                          {isOpen ? 'Collapse' : 'Expand'}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                          {member.connections!.map(c => (
                            <div key={c.id} className="group/card rounded-2xl border-2 border-accent/20 bg-gradient-to-r from-white/80 to-light/40 p-4 hover:shadow-lg transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">
                                  {c.name.split(' ').map(n => n.charAt(0)).join('')}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-bold text-dark">{c.name}</div>
                                  <div className="text-xs text-medium font-medium">{c.phone}</div>
                                </div>
                                <div className="h-2 w-2 bg-blue-500 rounded-full group-hover/card:animate-pulse"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="h-12 w-12 rounded-2xl bg-light mx-auto mb-3 flex items-center justify-center">
                        <svg className="h-6 w-6 text-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <path d="M20 8v6M23 11l-3 3-3-3" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-medium">No connections yet</div>
                      <div className="text-xs text-medium/60 mt-1">This member hasn't built their network</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced insights section */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-dark">Network Insights</div>
              <div className="text-sm text-medium font-medium">Performance and growth analytics</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-green-200/60 bg-gradient-to-br from-green-50 to-green-25 p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
                <div className="text-sm font-bold text-green-700">Growth Rate</div>
              </div>
              <div className="text-3xl font-bold text-dark mb-2">+24%</div>
              <div className="text-xs text-green-600 font-medium">↗ Network expanding steadily</div>
            </div>
            
            <div className="rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-25 p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                <div className="text-sm font-bold text-blue-700">Engagement</div>
              </div>
              <div className="text-3xl font-bold text-dark mb-2">87%</div>
              <div className="text-xs text-blue-600 font-medium">↗ High member activity</div>
            </div>
            
            <div className="rounded-2xl border-2 border-purple-200/60 bg-gradient-to-br from-purple-50 to-purple-25 p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <div className="text-sm font-bold text-purple-700">Performance</div>
              </div>
              <div className="text-3xl font-bold text-dark mb-2">92%</div>
              <div className="text-xs text-purple-600 font-medium">↗ Exceeding targets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkView
