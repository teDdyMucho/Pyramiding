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

function LeaderDashboard() {
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

  const totalConnections = 28
  const activeMembers = 16
  const teamSize = 52
  const communityPerformance = 84

  const baseUrl = (import.meta.env?.VITE_PUBLIC_APP_URL as string | undefined) ?? window.location.origin
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const inviteLink = user ? `${normalizedBaseUrl}/register?ref=${encryptRef(user.phone_number)}` : ''

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
