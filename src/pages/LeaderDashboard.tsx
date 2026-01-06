import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const goalTargets = { level1: 10, level2: 100, level3: 1000 }
  const [goalCounts, setGoalCounts] = useState({ level1: 0, level2: 0, level3: 0 })
  const [goalCountsError, setGoalCountsError] = useState<string | null>(null)
  const [claimedGoals, setClaimedGoals] = useState({ level1: false, level2: false, level3: false })
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
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle()
        if (error) return
        const code = (data as any)?.referral_code as string | null | undefined
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
          .select('goal1, goal2, goal3')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          const msg = (error.message ?? '').toLowerCase()
          if (msg.includes('column') && (msg.includes('goal1') || msg.includes('goal2') || msg.includes('goal3'))) {
            setGoalCountsError('Database columns goal1/goal2/goal3 not found. Please add them to points_ledger table.')
          } else {
            setGoalCountsError(error.message)
          }
          return
        }

        if (data) {
          setGoalCounts({
            level1: Number(data?.goal1 ?? 0),
            level2: Number(data?.goal2 ?? 0),
            level3: Number(data?.goal3 ?? 0)
          })
        }
      } catch (err) {
        setGoalCountsError('Unable to load goal counts.')
      }
    }

    fetchGoalCounts()
  }, [user?.id])

  useEffect(() => {
    const fetchTotalPoints = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('points_ledger')
          .select('points')
          .eq('id', user.id)
          .maybeSingle()

        if (!error && data) {
          setTotalPoints(Number(data?.points ?? 0))
        }
      } catch {
        // ignore
      }
    }

    fetchTotalPoints()
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

  const handleClaimGoal = (level: 'level1' | 'level2' | 'level3', goalName: string) => {
    setClaimedGoals(prev => ({ ...prev, [level]: true }))
    setShowCongrats({ show: true, level, goalName })
    setTimeout(() => {
      setShowCongrats({ show: false, level: '', goalName: '' })
    }, 4000)
  }

  const isGoalComplete = (level: 'level1' | 'level2' | 'level3') => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="group rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-7 w-7 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-medium mb-1">Total Points</div>
                <div className="text-3xl font-bold text-dark">{totalPoints}</div>
              </div>
            </div>
          </div>
          
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

            <div className="mx-auto w-full max-w-4xl rounded-2xl border-2 border-purple-200/60 bg-gradient-to-r from-purple-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-purple-700">Level 3</div>
                  <div className="text-base font-bold text-dark">Leadership Goal</div>
                  <div className="text-xs text-medium font-medium mt-1">Complete the top milestone</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-xs font-bold text-medium">Target</div>
                    <div className="w-24 rounded-xl border-2 border-purple-200 bg-white/80 px-3 py-2 text-sm font-bold text-dark">
                      {goalTargets.level3}
                    </div>
                    <div className="text-xs font-semibold text-medium">registrations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-medium">Progress</div>
                  <div className="text-lg font-bold text-dark">{progressForTarget(goalCounts.level3, goalTargets.level3).percent}%</div>
                  <div className="text-xs font-semibold text-medium mt-1">{progressForTarget(goalCounts.level3, goalTargets.level3).current} / {goalTargets.level3}</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-purple-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: `${progressForTarget(goalCounts.level3, goalTargets.level3).percent}%` }}></div>
              </div>
              {isGoalComplete('level3') && !claimedGoals.level3 && (
                <button
                  onClick={() => handleClaimGoal('level3', 'Leadership Goal')}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Claim Reward
                </button>
              )}
              {claimedGoals.level3 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-purple-600 font-semibold text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Claimed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderDashboard
