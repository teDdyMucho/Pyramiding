import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApprovalModal from '../components/ApprovalModal'
import StatusBadge from '../components/StatusBadge'
import { supabase } from '../lib/supabase'

type UserRow = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
  created_at: string
}

type Filter = 'pending' | 'approved'

type AssignableRole = 'users' | 'leaders'

function AdminApprovalDashboard() {
  const navigate = useNavigate()

  const webhookUrl = 'https://primary-production-6722.up.railway.app/webhook/invite'

  const [rows, setRows] = useState<UserRow[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<UserRow | null>(null)

  const fetchRows = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const q = supabase
        .from('users')
        .select('id, first_name, last_name, phone_number, role, created_at')
        .order('created_at', { ascending: false })

      const { data, error } = await q

      if (error) throw error

      setRows((data ?? []) as UserRow[])
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load accounts.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const normalized = search.trim().toLowerCase()

  const isPendingRole = (role: string) => {
    return role !== 'users' && role !== 'leaders' && role !== 'admin'
  }

  const filtered = useMemo(() => {
    return rows
      .filter(r => {
        const isPending = isPendingRole(r.role)
        if (filter === 'pending') return isPending
        return !isPending
      })
      .filter(r => {
        if (!normalized) return true
        const name = `${r.first_name} ${r.last_name}`.toLowerCase()
        return name.includes(normalized) || r.phone_number.toLowerCase().includes(normalized)
      })
  }, [rows, filter, normalized])

  const openApprove = (row: UserRow) => {
    setSelected(row)
    setModalOpen(true)
  }

  const closeApprove = () => {
    setModalOpen(false)
    setSelected(null)
  }

  const approve = async (userId: string, role: AssignableRole) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    if (error) throw error

    // Send webhook only when the account is approved to users/leaders
    if (role === 'users' || role === 'leaders') {
      try {
        const { data: approvedUser, error: approvedUserError } = await supabase
          .from('users')
          .select('id, first_name, last_name, phone_number, invite_code')
          .eq('id', userId)
          .maybeSingle()

        if (!approvedUserError && approvedUser) {
          const inviteCode = (approvedUser as any)?.invite_code as string | null | undefined

          let inviterPhoneNumber: string | null = null
          let inviterUserId: string | null = null

          if (inviteCode) {
            try {
              const { data: inviter, error: inviterError } = await supabase
                .from('users')
                .select('id, phone_number')
                .eq('referral_code', inviteCode)
                .maybeSingle()
              if (!inviterError) {
                inviterPhoneNumber = (inviter as any)?.phone_number ?? null
                inviterUserId = (inviter as any)?.id ?? null
              }
            } catch {
              // ignore
            }
          }

          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              first_name: (approvedUser as any)?.first_name,
              last_name: (approvedUser as any)?.last_name,
              phone_number: (approvedUser as any)?.phone_number,
              user_id: (approvedUser as any)?.id,
              invite_code: inviteCode ?? null,
              inviter_phone_number: inviterPhoneNumber,
              inviter_user_id: inviterUserId,
              approved_role: role,
            }),
          })
        }
      } catch {
        // ignore
      }
    }

    await fetchRows()
  }

  const signOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/8 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-dark/3 to-transparent rounded-full blur-2xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-dark to-medium flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11l-3 3-3-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-dark">Account Management</h1>
                <p className="text-medium font-medium">Review and approve user access requests</p>
              </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-accent/20 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{filtered.filter(r => isPendingRole(r.role)).length}</div>
                    <div className="text-xs font-semibold text-medium">Pending Review</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-accent/20 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{filtered.filter(r => !isPendingRole(r.role)).length}</div>
                    <div className="text-xs font-semibold text-medium">Approved</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-accent/20 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{rows.length}</div>
                    <div className="text-xs font-semibold text-medium">Total Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={signOut}
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

        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden">
          {/* Enhanced control panel */}
          <div className="bg-gradient-to-r from-light/40 to-white/60 border-b border-accent/10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/80 rounded-2xl p-1 shadow-inner border border-accent/20">
                  <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={
                      filter === 'pending'
                        ? 'relative rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg transform transition-all duration-200'
                        : 'rounded-xl px-6 py-3 text-sm font-bold text-medium hover:text-dark hover:bg-white/60 transition-all duration-200'
                    }
                  >
                    {filter === 'pending' && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 animate-pulse opacity-20"></div>
                    )}
                    <span className="relative flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                      Pending ({filtered.filter(r => isPendingRole(r.role)).length})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('approved')}
                    className={
                      filter === 'approved'
                        ? 'relative rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg transform transition-all duration-200'
                        : 'rounded-xl px-6 py-3 text-sm font-bold text-medium hover:text-dark hover:bg-white/60 transition-all duration-200'
                    }
                  >
                    {filter === 'approved' && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-green-500 animate-pulse opacity-20"></div>
                    )}
                    <span className="relative flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approved ({filtered.filter(r => !isPendingRole(r.role)).length})
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full lg:w-80 rounded-2xl border-2 border-accent/20 bg-white/80 backdrop-blur-sm pl-10 pr-4 py-3 text-sm font-medium text-dark placeholder-medium/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchRows}
                  className="group inline-flex items-center rounded-2xl bg-gradient-to-r from-dark to-medium px-6 py-3 text-sm font-bold text-light hover:from-medium hover:to-dark transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <svg className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mx-6 mt-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-25 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
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

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gradient-to-r from-light/60 to-white/40 border-b border-accent/10">
                <tr className="text-xs font-bold text-dark">
                  <th className="py-4 px-6 font-bold">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                      </svg>
                      Account Holder
                    </div>
                  </th>
                  <th className="py-4 px-6 font-bold">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      Contact
                    </div>
                  </th>
                  <th className="py-4 px-6 font-bold">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Registration Date
                    </div>
                  </th>
                  <th className="py-4 px-6 font-bold">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Status
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-accent/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent"></div>
                        <span className="text-medium font-semibold">Loading accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-light flex items-center justify-center">
                          <svg className="h-6 w-6 text-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                          </svg>
                        </div>
                        <div className="text-medium font-semibold">No accounts found</div>
                        <div className="text-sm text-medium/60">Try adjusting your search or filter criteria</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const pending = isPendingRole(r.role)
                    return (
                      <tr key={r.id} className="group hover:bg-light/30 transition-colors duration-200">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                              {r.first_name.charAt(0)}{r.last_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-dark">{r.first_name} {r.last_name}</div>
                              <div className="text-xs text-medium font-medium">ID: {r.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="font-semibold text-dark">{r.phone_number}</div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="font-semibold text-dark">{new Date(r.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-medium font-medium">{new Date(r.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="py-5 px-6">
                          <StatusBadge status={pending ? 'Pending Approval' : 'Approved'} />
                        </td>
                        <td className="py-5 px-6 text-right">
                          {pending ? (
                            <button
                              type="button"
                              onClick={() => openApprove(r)}
                              className="group/btn inline-flex items-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-bold text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                            >
                              <svg className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Approve
                            </button>
                          ) : (
                            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Approved
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ApprovalModal open={modalOpen} user={selected} onClose={closeApprove} onConfirm={approve} />
    </div>
  )
}

export default AdminApprovalDashboard
