import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

function ReferralCodePage() {
  const location = useLocation()

  const ref = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('ref') ?? ''
  }, [location.search])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ref)
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/90 border border-white/50 shadow-2xl p-8">
        <div className="text-2xl font-bold text-dark mb-2">Wait for your referral code</div>
        <div className="text-sm text-medium mb-6">
          Copy the code below and keep it safe. You can paste it during registration.
        </div>

        <div className="rounded-2xl border-2 border-accent/20 bg-white/80 p-4">
          <div className="text-xs font-bold text-medium mb-2">Referral Code</div>
          <div className="flex gap-3">
            <input
              value={ref}
              readOnly
              className="flex-1 rounded-xl border-2 border-accent/20 bg-white px-4 py-3 text-sm font-medium text-dark focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 text-sm font-bold text-white"
              disabled={!ref}
            >
              Copy
            </button>
          </div>
          {!ref && (
            <div className="text-xs text-red-600 font-medium mt-3">No referral code found in the link.</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link to="/" className="text-sm font-bold text-purple-600 hover:text-purple-700">
            Back to home
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-dark to-medium px-6 py-3 text-sm font-bold text-light"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReferralCodePage
