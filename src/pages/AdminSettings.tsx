import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

function AdminSettings() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-light via-white to-accent/5">
      <AdminSidebar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg">
                <svg className="h-7 w-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">Settings</h1>
                <p className="text-medium font-medium">Configure system settings</p>
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

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* General Settings */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">General Settings</h2>
                  <p className="text-sm text-medium">System configuration and preferences</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-light/30">
                  <div>
                    <div className="font-semibold text-dark">Platform Name</div>
                    <div className="text-sm text-medium">Own Property Platform</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-accent text-dark font-semibold text-sm hover:bg-accent/80 transition-all">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-light/30">
                  <div>
                    <div className="font-semibold text-dark">Registration Approval</div>
                    <div className="text-sm text-medium">Require admin approval for new users</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Points & Rewards */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Points & Rewards</h2>
                  <p className="text-sm text-medium">Configure earning and reward settings</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-light/30">
                  <div>
                    <div className="font-semibold text-dark">Points per Registration</div>
                    <div className="text-sm text-medium">₱200 per successful referral</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-accent text-dark font-semibold text-sm hover:bg-accent/80 transition-all">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-light/30">
                  <div>
                    <div className="font-semibold text-dark">Goal 1 Target</div>
                    <div className="text-sm text-medium">10 registrations</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-accent text-dark font-semibold text-sm hover:bg-accent/80 transition-all">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-light/30">
                  <div>
                    <div className="font-semibold text-dark">Goal 2 Target</div>
                    <div className="text-sm text-medium">100 registrations</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-accent text-dark font-semibold text-sm hover:bg-accent/80 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">System Information</h2>
                  <p className="text-sm text-medium">Platform details and version</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-light/30">
                  <div className="text-sm text-medium mb-1">Version</div>
                  <div className="font-bold text-dark">1.0.0</div>
                </div>
                <div className="p-4 rounded-xl bg-light/30">
                  <div className="text-sm text-medium mb-1">Environment</div>
                  <div className="font-bold text-dark">Production</div>
                </div>
                <div className="p-4 rounded-xl bg-light/30">
                  <div className="text-sm text-medium mb-1">Database</div>
                  <div className="font-bold text-dark">Supabase</div>
                </div>
                <div className="p-4 rounded-xl bg-light/30">
                  <div className="text-sm text-medium mb-1">Last Updated</div>
                  <div className="font-bold text-dark">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
