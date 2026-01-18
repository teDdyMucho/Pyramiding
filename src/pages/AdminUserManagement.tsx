import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminSidebar from '../components/AdminSidebar'

type UserData = {
  id: string
  first_name: string
  last_name: string
  userlogin: string
  phone_number: string
  myreferralcode: string
  whoinvite: string
  teamleader: string
  role: string
  goal1: number
  goal2: number
  points: number
  withdrawable: number
  projectpayment: number
  network_count: number
}

function AdminUserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Fetch users with their points_ledger data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, userlogin, phone_number, myreferralcode, whoinvite, teamleader, role')
        .in('role', ['users', 'leaders', 'admin'])
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch points_ledger data for all users
      const { data: pointsData, error: pointsError } = await supabase
        .from('points_ledger')
        .select('id, goal1, goal2, points, withdrawable, projectpayment')

      if (pointsError) throw pointsError

      // Merge the data
      const mergedData: UserData[] = (usersData || []).map(user => {
        const pointsInfo = (pointsData || []).find(p => p.id === user.id)
        return {
          ...user,
          goal1: pointsInfo?.goal1 || 0,
          goal2: pointsInfo?.goal2 || 0,
          points: pointsInfo?.points || 0,
          withdrawable: pointsInfo?.withdrawable || 0,
          projectpayment: pointsInfo?.projectpayment || 0,
          network_count: 0 // Will be calculated
        }
      })

      // Calculate network count for each user
      for (let i = 0; i < mergedData.length; i++) {
        const user = mergedData[i]
        const { data: networkData } = await supabase
          .from('users')
          .select('id')
          .eq('whoinvite', user.myreferralcode)
        
        mergedData[i].network_count = (networkData || []).length
      }

      setUsers(mergedData)
      setFilteredUsers(mergedData)
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users)
      return
    }

    const searchLower = search.toLowerCase()
    const filtered = users.filter(user => 
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.userlogin.toLowerCase().includes(searchLower) ||
      user.phone_number.includes(searchLower) ||
      user.myreferralcode.toLowerCase().includes(searchLower)
    )
    setFilteredUsers(filtered)
  }, [search, users])

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  const totalUsers = users.length
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0)
  const totalWithdrawable = users.reduce((sum, u) => sum + u.withdrawable, 0)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-light via-white to-accent/5">
      <AdminSidebar />
      
      <div className="flex-1">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark">User Management</h1>
              <p className="text-medium font-medium">View and manage all users</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark hover:bg-accent/5 transition-all"
          >
            Sign out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-medium">Total Users</div>
                <div className="text-3xl font-bold text-dark">{totalUsers}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-medium">Total Points</div>
                <div className="text-3xl font-bold text-dark">{totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-medium">Total Cash</div>
                <div className="text-3xl font-bold text-dark">₱{totalWithdrawable.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-bold text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 mb-6">
            {errorMessage}
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-dark to-medium text-light">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">First Name</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Last Name</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">User ID</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Phone</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Network</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Goal 1</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Goal 2</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Points</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Cash</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Investment</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Referral Code</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Who Invite</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase">Team Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-medium">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-medium">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{user.first_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{user.last_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-medium">{user.userlogin}</td>
                      <td className="px-4 py-3 text-sm text-medium">{user.phone_number}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">{user.network_count}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{user.goal1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{user.goal2}</td>
                      <td className="px-4 py-3 text-sm font-bold text-amber-600">{user.points}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">₱{user.withdrawable.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">₱{user.projectpayment.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-mono text-purple-600">{user.myreferralcode}</td>
                      <td className="px-4 py-3 text-sm text-medium">{user.whoinvite || '-'}</td>
                      <td className="px-4 py-3 text-sm text-medium">{user.teamleader || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-sm text-medium font-medium">
            Showing {filteredUsers.length} of {totalUsers} users
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserManagement
