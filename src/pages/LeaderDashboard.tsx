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
  const goalTargets = { level1: 10, level2: 100, level3: 1000 }
  const [goalCounts, setGoalCounts] = useState({ level1: 0, level2: 0, level3: 0 })
  const [goalCountsError, setGoalCountsError] = useState<string | null>(null)

  const user = useMemo(() => {
    const raw = localStorage.getItem('app_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }, [])

  const totalConnections = 28
  const activeMembers = 16
  const teamSize = 52
  const communityPerformance = 84

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

        const baseQ = supabase
          .from('points_ledger')
          .select('goal1, goal2, goal3')

        // Prefer linking by referral code text (refferal) when available.
        // If it returns no rows (or your ledger uses UUID linking), fallback to inviter_code_uuid.
        let data: any[] | null = null
        let error: any = null

        if (referralCode) {
          const byCode = await (supabase
            .from('points_ledger')
            .select('goal1, goal2, goal3')
            // NOTE: DB column is spelled refferal in your schema.
            .eq('refferal', referralCode))

          data = (byCode as any).data
          error = (byCode as any).error

          if (!error && Array.isArray(data) && data.length === 0) {
            const byUuid = await baseQ.eq('inviter_code_uuid', user.id)
            data = (byUuid as any).data
            error = (byUuid as any).error
          }
        } else {
          const byUuid = await baseQ.eq('inviter_code_uuid', user.id)
          data = (byUuid as any).data
          error = (byUuid as any).error
        }

        if (error) {
          const msg = (error.message ?? '').toLowerCase()
          if (msg.includes('column') && msg.includes('goal1') && msg.includes('does not exist')) {
            setGoalCountsError('Your points_ledger table has no goal1/goal2/goal3 columns yet. Add these columns in Supabase first.')
          } else {
            setGoalCountsError(error.message)
          }
          return
        }

        const rows = (data ?? []) as any[]
        const sums = rows.reduce(
          (acc, r) => {
            acc.level1 += Number(r?.goal1 ?? 0)
            acc.level2 += Number(r?.goal2 ?? 0)
            acc.level3 += Number(r?.goal3 ?? 0)
            return acc
          },
          { level1: 0, level2: 0, level3: 0 }
        )
        setGoalCounts(sums)
      } catch {
        setGoalCountsError('Unable to load goal counts.')
      }
    }

    fetchGoalCounts()
  }, [user?.id, referralCode])

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

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 relative overflow-hidden">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-6">
            <div className="text-sm font-bold text-medium mb-1">Total Connections</div>
            <div className="text-3xl font-bold text-dark">{totalConnections}</div>
          </div>
          <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-6">
            <div className="text-sm font-bold text-medium mb-1">Active Members</div>
            <div className="text-3xl font-bold text-dark">{activeMembers}</div>
          </div>
          <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-6">
            <div className="text-sm font-bold text-medium mb-1">Team Size</div>
            <div className="text-3xl font-bold text-dark">{teamSize}</div>
          </div>
          <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-6">
            <div className="text-sm font-bold text-medium mb-1">Performance</div>
            <div className="text-3xl font-bold text-dark">{communityPerformance}%</div>
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
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-8">
          <div className="text-sm font-bold text-dark mb-3">Team Invite</div>
          <div className="flex gap-3">
            <input
              value={inviteLink}
              readOnly
              className="flex-1 rounded-xl border-2 border-accent/20 bg-white/80 px-4 py-3 text-sm font-medium text-dark focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={
                copied
                  ? 'rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg'
                  : 'rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 text-sm font-bold text-white'
              }
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {copied && <div className="mt-2 text-xs font-bold text-emerald-600">Copied!</div>}
        </div>

        <div className="mt-8">
          <Link
            to="/network"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-dark to-medium px-8 py-4 text-lg font-bold text-light"
          >
            View Team Network
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LeaderDashboard
