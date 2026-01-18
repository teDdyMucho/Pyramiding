import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { encryptRef } from '../utils/encryption'
import { supabase } from '../lib/supabase'

type AppRole = 'users' | 'leaders' | 'admin'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: AppRole
}

function LeaderDashboard() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState<string>('')
  const goalTargets = { level1: 10, level2: 100 }
  const [goalCounts, setGoalCounts] = useState({ level1: 0, level2: 0 })
  const [goalCountsError, setGoalCountsError] = useState<string | null>(null)
  const [claimedGoals, setClaimedGoals] = useState({ level1: false, level2: false })
  const [showCongrats, setShowCongrats] = useState<{ show: boolean; level: string; goalName: string }>({ show: false, level: '', goalName: '' })

  const user = useMemo(() => {
    const raw = localStorage.getItem('app_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }, [])

  const [totalPoints, setTotalPoints] = useState(0)
  const [cashWithdrawable, setCashWithdrawable] = useState(0)
  const [investment, setInvestment] = useState(0)
  const [networkCounts, setNetworkCounts] = useState({ members: 0, totalNetwork: 0 })

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ((import.meta.env?.VITE_PUBLIC_APP_URL as string | undefined) ?? '')
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const inviteRef = user ? (referralCode || encryptRef(user.phone_number)) : ''
  const inviteLink = user ? `${normalizedBaseUrl}/register?ref=${inviteRef}` : ''

  useEffect(() => {
    const fetchReferral = async () => {
      if (!user?.id) return
      try {
        const { data, error } = await supabase
          .from('users')
          .select('myreferralcode')
          .eq('id', user.id)
          .maybeSingle()
        if (error) return
        const code = (data as any)?.myreferralcode as string | null | undefined
        if (code) setReferralCode(code)
      } catch {
        // ignore
      }
    }

    fetchReferral()
  }, [user?.id])

  useEffect(() => {
    const fetchNetworkCounts = async () => {
      if (!user?.id || !referralCode) return
      
      try {
        // Get direct team members (teamleader = my referral code)
        const { data: directMembers, error: directError } = await supabase
          .from('users')
          .select('id, myreferralcode')
          .eq('teamleader', referralCode)
          .in('role', ['users', 'leaders'])
        
        if (directError) return
        
        const memberCount = (directMembers ?? []).length
        
        // Get all referral codes from direct members
        const memberCodes = (directMembers ?? []).map((m: any) => m.myreferralcode).filter(Boolean)
        
        let totalNetworkCount = memberCount
        
        if (memberCodes.length > 0) {
          // Get direct invites of all team members (whoinvite = member's code)
          const { data: allInvites, error: invitesError } = await supabase
            .from('users')
            .select('id')
            .in('whoinvite', memberCodes)
            .in('role', ['users', 'leaders'])
          
          if (!invitesError) {
            totalNetworkCount += (allInvites ?? []).length
          }
        }
        
        setNetworkCounts({ members: memberCount, totalNetwork: totalNetworkCount })
      } catch {
        // ignore
      }
    }
    
    fetchNetworkCounts()
  }, [user?.id, referralCode])

  useEffect(() => {
    const fetchGoalCounts = async () => {
      if (!user?.id) return

      try {
        setGoalCountsError(null)

        const { data, error } = await supabase
          .from('points_ledger')
          .select('goal1, goal2')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          const msg = (error.message ?? '').toLowerCase()
          if (msg.includes('column') && (msg.includes('goal1') || msg.includes('goal2'))) {
            setGoalCountsError('Database columns goal1/goal2 not found. Please add them to points_ledger table.')
          } else {
            setGoalCountsError(error.message)
          }
          return
        }

        if (data) {
          setGoalCounts({
            level1: Number(data?.goal1 ?? 0),
            level2: Number(data?.goal2 ?? 0)
          })
        }
      } catch (err) {
        setGoalCountsError('Unable to load goal counts.')
      }
    }

    fetchGoalCounts()
  }, [user?.id])

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('points_ledger')
          .select('points, withdrawable, projectpayment')
          .eq('id', user.id)
          .maybeSingle()

        if (!error && data) {
          setTotalPoints(Number(data?.points ?? 0))
          setCashWithdrawable(Number(data?.withdrawable ?? 0))
          setInvestment(Number(data?.projectpayment ?? 0))
        }
      } catch {
        // ignore
      }
    }

    fetchFinancialData()
  }, [user?.id])

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

  const progressForTarget = (currentRaw: number, target: number) => {
    const current = clamp(Math.max(0, currentRaw), 0, target)
    const percent = target ? Math.max(0, Math.min(100, Math.round((current / target) * 100))) : 0
    return { current, target, percent }
  }

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

  const handleClaimGoal = (level: 'level1' | 'level2', goalName: string) => {
    setClaimedGoals(prev => ({ ...prev, [level]: true }))
    setShowCongrats({ show: true, level, goalName })
    setTimeout(() => {
      setShowCongrats({ show: false, level: '', goalName: '' })
    }, 4000)
  }

  const isGoalComplete = (level: 'level1' | 'level2') => {
    const progress = progressForTarget(goalCounts[level], goalTargets[level])
    return progress.percent === 100
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 relative overflow-hidden">
      {/* Congratulations Modal */}
      {showCongrats.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">Congratulations!</h2>
              <p className="text-medium font-medium mb-4">
                You've successfully achieved the <span className="font-bold text-dark">{showCongrats.goalName}</span>!
              </p>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Goal Claimed
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark">
              Welcome, {user.first_name} {user.last_name}
            </h1>
            <p className="text-medium font-medium mt-1">Team Leadership Dashboard</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Points</div>
                <div className="text-3xl font-bold text-dark">{totalPoints}</div>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Cash</div>
                <div className="text-3xl font-bold text-dark">₱{cashWithdrawable.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Investment</div>
                <div className="text-3xl font-bold text-dark">₱{investment.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-medium mb-1">Referral Code</div>
                  <div className="text-2xl font-bold text-dark">{referralCode || 'Loading...'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={
                  copied
                    ? 'rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 shadow-lg'
                    : 'rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg'
                }
              >
                {copied ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2l10 18H2L12 2z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-dark">Goals</div>
            </div>
          </div>

          {goalCountsError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {goalCountsError}
            </div>
          )}

          <div className="space-y-4">
            <div className="mx-auto w-full max-w-2xl rounded-2xl border-2 border-green-200/60 bg-gradient-to-r from-green-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-green-700">Level 1</div>
                  <div className="text-base font-bold text-dark">Starter Goal</div>
                  <div className="text-xs text-medium font-medium mt-1">Complete the first step to unlock more goals</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-xs font-bold text-medium">Target</div>
                    <div className="w-24 rounded-xl border-2 border-green-200 bg-white/80 px-3 py-2 text-sm font-bold text-dark">
                      {goalTargets.level1}
                    </div>
                    <div className="text-xs font-semibold text-medium">registrations</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-xs font-bold text-medium">Earnings</div>
                    <div className="rounded-xl border-2 border-green-200 bg-white/80 px-3 py-2 text-sm font-bold text-green-600">
                      ₱{(goalCounts.level1 * 200).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-medium">Progress</div>
                  <div className="text-lg font-bold text-dark">{progressForTarget(goalCounts.level1, goalTargets.level1).percent}%</div>
                  <div className="text-xs font-semibold text-medium mt-1">{progressForTarget(goalCounts.level1, goalTargets.level1).current} / {goalTargets.level1}</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-green-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${progressForTarget(goalCounts.level1, goalTargets.level1).percent}%` }}></div>
              </div>
              {isGoalComplete('level1') && !claimedGoals.level1 && (
                <button
                  onClick={() => handleClaimGoal('level1', 'Starter Goal')}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-bold text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Claim Reward
                </button>
              )}
              {claimedGoals.level1 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Claimed
                </div>
              )}
            </div>

            <div className="mx-auto w-full max-w-3xl rounded-2xl border-2 border-blue-200/60 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-blue-700">Level 2</div>
                  <div className="text-base font-bold text-dark">Team Growth Goal</div>
                  <div className="text-xs text-medium font-medium mt-1">Hit the next team milestone</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-xs font-bold text-medium">Target</div>
                    <div className="w-24 rounded-xl border-2 border-blue-200 bg-white/80 px-3 py-2 text-sm font-bold text-dark">
                      {goalTargets.level2}
                    </div>
                    <div className="text-xs font-semibold text-medium">registrations</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-xs font-bold text-medium">Earnings</div>
                    <div className="rounded-xl border-2 border-blue-200 bg-white/80 px-3 py-2 text-sm font-bold text-blue-600">
                      ₱{(goalCounts.level2 * 200).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-medium">Progress</div>
                  <div className="text-lg font-bold text-dark">{progressForTarget(goalCounts.level2, goalTargets.level2).percent}%</div>
                  <div className="text-xs font-semibold text-medium mt-1">{progressForTarget(goalCounts.level2, goalTargets.level2).current} / {goalTargets.level2}</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-blue-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${progressForTarget(goalCounts.level2, goalTargets.level2).percent}%` }}></div>
              </div>
              {isGoalComplete('level2') && !claimedGoals.level2 && (
                <button
                  onClick={() => handleClaimGoal('level2', 'Team Growth Goal')}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-bold text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Claim Reward
                </button>
              )}
              {claimedGoals.level2 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Claimed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Network Tree Panel - Only for Leaders */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-dark">Network Tree</div>
                <div className="text-sm text-medium font-medium">View your team structure and connections</div>
              </div>
            </div>
            <Link
              to="/network"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-bold text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Network
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-25 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-blue-700">Team Overview</div>
                <div className="text-xs text-blue-600 font-medium">Track your network growth and member activity</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/80 p-4">
                <div className="text-xs font-semibold text-medium mb-1">Total Member</div>
                <div className="text-2xl font-bold text-dark">{networkCounts.members}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-4">
                <div className="text-xs font-semibold text-medium mb-1">Total Network</div>
                <div className="text-2xl font-bold text-dark">{networkCounts.totalNetwork}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderDashboard
