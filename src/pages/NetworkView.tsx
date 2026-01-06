import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  active?: boolean
  earnedPoints?: number
}

const maskPhone = (phone: string) => {
  const p = (phone ?? '').trim()
  if (!p) return ''
  if (p.length <= 4) return p
  const lastFour = p.slice(-4)
  const maskedPart = 'x'.repeat(p.length - 4)
  return `${maskedPart}${lastFour}`
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
  const [data, setData] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadNetwork = async () => {
      if (!user?.id) return
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const isApprovedRole = (r: any) => r === 'users' || r === 'leaders'

        let currentReferralCode: string | null = null
        try {
          const { data: me, error: meError } = await supabase
            .from('users')
            .select('myreferralcode')
            .eq('id', user.id)
            .maybeSingle()
          if (!meError) currentReferralCode = (me as any)?.myreferralcode ?? null
        } catch {
          // ignore
        }

        if (!currentReferralCode) {
          setData([])
          return
        }

        // Query users who have this leader's referral code in their teamleader column
        const { data: directUsers, error: directUsersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, phone_number, role, myreferralcode')
          .eq('teamleader', currentReferralCode)
          .in('role', ['users', 'leaders'])

        if (directUsersError) throw directUsersError

        const directUserRows = (directUsers ?? []) as any[]

        if (directUserRows.length === 0) {
          setData([])
          return
        }

        // Get all referral codes from direct team members
        const directReferralCodes = directUserRows
          .map(u => u.myreferralcode)
          .filter(Boolean) as string[]

        // Fetch direct invites for each team member (users who used their myreferralcode)
        let invitesByMemberCode = new Map<string, any[]>()
        if (directReferralCodes.length > 0) {
          const { data: allInvites, error: invitesError } = await supabase
            .from('users')
            .select('id, first_name, last_name, phone_number, role, whoinvite')
            .in('whoinvite', directReferralCodes)
            .in('role', ['users', 'leaders'])

          if (!invitesError && allInvites) {
            (allInvites as any[]).forEach((invite: any) => {
              const code = invite.whoinvite
              if (!code) return
              const existing = invitesByMemberCode.get(code) ?? []
              existing.push(invite)
              invitesByMemberCode.set(code, existing)
            })
          }
        }

        const members: Member[] = directUserRows
          .filter((u: any) => isApprovedRole((u as any)?.role))
          .map((u: any) => {
            const phone = (u as any).phone_number as string
            const name = `${(u as any).first_name} ${(u as any).last_name}`.trim()
            const memberCode = (u as any).myreferralcode
            
            // Get this member's direct invites
            const directInvites = invitesByMemberCode.get(memberCode) ?? []
            const connections: Member[] = directInvites.map((invite: any) => {
              const inviteName = `${invite.first_name} ${invite.last_name}`.trim()
              return {
                id: invite.id,
                name: inviteName,
                phone: invite.phone_number,
                active: isApprovedRole(invite.role),
              }
            })

            return {
              id: (u as any).id ?? phone,
              name,
              phone,
              active: isApprovedRole((u as any).role),
              earnedPoints: 0,
              connections: connections.length > 0 ? connections : undefined,
            }
          })

        setData(members)
      } catch (e: any) {
        setErrorMessage((e?.message ?? 'Failed to load network.') as string)
      } finally {
        setIsLoading(false)
      }
    }

    loadNetwork()
  }, [user?.id])

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data

    const match = (m: Member) => {
      return (
        (m.name ?? '').toLowerCase().includes(q) ||
        (m.phone ?? '').toLowerCase().includes(q) ||
        maskPhone(m.phone ?? '').toLowerCase().includes(q)
      )
    }

    return data
      .map((m) => {
        const matchesSelf = match(m)
        const connections = (m.connections ?? []).filter(match)
        if (!matchesSelf && connections.length === 0) return null
        return { ...m, connections: connections.length ? connections : undefined }
      })
      .filter(Boolean) as Member[]
  }, [data, search])

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
                  <div className="text-sm text-medium font-medium mt-1">{maskPhone(user.phone_number)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-25 p-4 text-center">
                  <div className="text-sm font-bold text-blue-700 mb-1">Member</div>
                  <div className="text-3xl font-bold text-dark">{isLoading ? '...' : data.length}</div>
                </div>
                <div className="rounded-2xl border-2 border-green-200/60 bg-gradient-to-br from-green-50 to-green-25 p-4 text-center">
                  <div className="text-sm font-bold text-green-700 mb-1">Total Network</div>
                  <div className="text-3xl font-bold text-dark">
                    {isLoading ? '...' : data.reduce((acc, m) => acc + (m.connections?.length || 0), data.length)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-dark">
                <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                Search
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone (09xxxxxxxxx)"
                className="flex-1 rounded-2xl border-2 border-accent/20 bg-white/70 px-4 py-3 text-sm font-semibold text-dark placeholder-medium/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
              />
              {search.trim() && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded-2xl border-2 border-accent/20 bg-white/70 px-4 py-3 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/40 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Enhanced network visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {filteredData.map((member) => {
            const isOpen = !!expanded[member.id]
            const hasConnections = !!member.connections?.length
            const connectionCount = member.connections?.length || 0
            const memberActive = member.active !== false
            const earnedPoints = member.earnedPoints ?? 0

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
                        <div className="text-sm text-medium font-medium">{maskPhone(member.phone)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={memberActive ? 'h-2 w-2 bg-green-500 rounded-full animate-pulse' : 'h-2 w-2 bg-gray-400 rounded-full'}></div>
                          <div className={memberActive ? 'text-xs text-green-600 font-semibold' : 'text-xs text-gray-600 font-semibold'}>
                            {memberActive ? 'Active member' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-medium mb-1">Connections</div>
                      <div className="text-2xl font-bold text-dark">{connectionCount}</div>
                      <div className="mt-2 text-sm font-bold text-medium mb-1">Points</div>
                      <div className="text-xl font-bold text-dark">{earnedPoints}</div>
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
                                  <div className="text-xs text-medium font-medium">{maskPhone(c.phone)}</div>
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

      </div>
    </div>
  )
}

export default NetworkView
