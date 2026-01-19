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

function UserDashboard() {
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
  const baseUrl = (typeof window !== 'undefined' ? window.location.origin : (import.meta.env?.VITE_PUBLIC_APP_URL as string | undefined) || '')
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

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link to="/shop" className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
          </Link>

          <Link to="/withdrawal" className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
          </Link>

          <Link to="/investment" className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
          </Link>
        </div>

        {/* Referral Code Card */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 mb-10">
          <div className="group">
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

        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-8 mb-10">
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
              <div className="text-sm text-medium font-medium">Your roadmap (UI only)</div>
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
                  <div className="text-xs text-medium font-medium mt-1">Finish the first step to unlock more goals</div>
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
                  <div className="text-base font-bold text-dark">Growth Goal</div>
                  <div className="text-xs text-medium font-medium mt-1">Reach the next target milestone</div>
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
                  onClick={() => handleClaimGoal('level2', 'Growth Goal')}
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






