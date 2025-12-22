import { useEffect, useState } from 'react'

type AssignableRole = 'users' | 'leaders'

type PendingUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
  created_at: string
}

type Props = {
  open: boolean
  user: PendingUser | null
  onClose: () => void
  onConfirm: (userId: string, role: AssignableRole) => Promise<void>
}

function ApprovalModal({ open, user, onClose, onConfirm }: Props) {
  const [selectedRole, setSelectedRole] = useState<AssignableRole>('users')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelectedRole('users')
      setIsSubmitting(false)
      setErrorMessage(null)
    }
  }, [open])

  if (!open || !user) return null

  const handleConfirm = async () => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      await onConfirm(user.id, selectedRole)
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Action failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-dark/30 via-dark/40 to-dark/50 animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 animate-in zoom-in-95 duration-300">
        <div className="p-8">
          {/* Enhanced header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 border border-green-200/60 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-dark mb-1">Account Approval</div>
              <div className="text-sm text-medium font-medium">Review and assign access permissions</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-light hover:bg-accent/10 flex items-center justify-center text-medium hover:text-dark transition-colors duration-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-25 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm animate-in slide-in-from-top-2 duration-200">
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

          {/* Enhanced user info card */}
          <div className="mb-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-light/60 to-white/80 p-6 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
              </svg>
              <div className="text-sm font-bold text-dark">Account Information</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center font-bold text-accent text-lg">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-dark">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-medium font-medium">{user.phone_number}</div>
                <div className="text-xs text-medium/80 font-medium mt-1">
                  Registered: {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced role selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-dark mb-3">Access Level Assignment</label>
            <div className="space-y-3">
              <div
                onClick={() => setSelectedRole('users')}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                  selectedRole === 'users'
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-25 shadow-md'
                    : 'border-accent/20 bg-white/60 hover:border-accent/40 hover:bg-light/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'users' ? 'border-blue-500 bg-blue-500' : 'border-accent/40'
                  }`}>
                    {selectedRole === 'users' && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-dark">Standard User</div>
                    <div className="text-sm text-medium font-medium">Basic access to user dashboard and network view</div>
                  </div>
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div
                onClick={() => setSelectedRole('leaders')}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                  selectedRole === 'leaders'
                    ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-purple-25 shadow-md'
                    : 'border-accent/20 bg-white/60 hover:border-accent/40 hover:bg-light/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'leaders' ? 'border-purple-500 bg-purple-500' : 'border-accent/40'
                  }`}>
                    {selectedRole === 'leaders' && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-dark">Team Leader</div>
                    <div className="text-sm text-medium font-medium">Enhanced access with team management capabilities</div>
                  </div>
                  <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11l-3 3-3-3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="group w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-8 py-4 text-sm font-bold text-dark hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              disabled={isSubmitting}
            >
              <svg className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="group w-full sm:flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 text-sm font-bold text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              disabled={isSubmitting}
            >
              <svg className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isSubmitting ? 'Processing...' : 'Approve Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApprovalModal
