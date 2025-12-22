import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import SignIn from './pages/SignIn'
import UserDashboard from './pages/UserDashboard'
import LeaderDashboard from './pages/LeaderDashboard'
import NetworkView from './pages/NetworkView'
import PendingApproval from './pages/PendingApproval'
import AdminApprovalDashboard from './pages/AdminApprovalDashboard'
import ReferralCodePage from './pages/ReferralCodePage'
import { supabase } from './lib/supabase'

type ApprovedRole = 'users' | 'leaders' | 'admin'

type AuthUser = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
}

const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('app_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

const isApprovedRole = (role: string): role is ApprovedRole => {
  return role === 'users' || role === 'leaders' || role === 'admin'
}

const roleHome = (role: string): string => {
  if (role === 'users') return '/dashboard/user'
  if (role === 'leaders') return '/dashboard/leader'
  if (role === 'admin') return '/admin/approvals'
  return '/pending-approval'
}

function RoleSync() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const initial = getStoredUser()
    if (!initial?.id) return

    let isMounted = true

    const applyRole = (nextRole: string) => {
      const current = getStoredUser()
      if (!current) return

      if (current.role !== nextRole) {
        localStorage.setItem('app_user', JSON.stringify({ ...current, role: nextRole }))
      }

      const target = roleHome(nextRole)
      const path = location.pathname

      if (path === '/register') {
        const params = new URLSearchParams(location.search)
        if (params.get('ref')) return
      }

      if (!isApprovedRole(nextRole)) {
        if (path !== '/pending-approval') navigate('/pending-approval', { replace: true })
        return
      }

      if (nextRole === 'admin') {
        if (!path.startsWith('/admin')) navigate(target, { replace: true })
        return
      }

      if (path.startsWith('/network')) {
        return
      }

      if (!path.startsWith('/dashboard')) {
        navigate(target, { replace: true })
        return
      }

      if ((nextRole === 'users' && path !== '/dashboard/user') || (nextRole === 'leaders' && path !== '/dashboard/leader')) {
        navigate(target, { replace: true })
      }
    }

    const fetchRole = async () => {
      const current = getStoredUser()
      if (!current?.id) return
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', current.id)
          .maybeSingle()
        if (error || !data) return
        if (!isMounted) return
        applyRole((data as any).role as string)
      } catch {
        // ignore
      }
    }

    fetchRole()

    const channel = supabase
      .channel(`role-sync:${initial.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${initial.id}` },
        (payload: any) => {
          if (!isMounted) return
          const nextRole = (payload.new as any)?.role as string | undefined
          if (nextRole) applyRole(nextRole)
        }
      )
      .subscribe()

    const poll = window.setInterval(() => {
      fetchRole()
    }, 8000)

    return () => {
      isMounted = false
      window.clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [location.pathname, location.search, navigate])

  return null
}

function DashboardIndexRedirect() {
  const user = getStoredUser()
  if (!user) return <Navigate to="/signin" replace />
  return <Navigate to={roleHome(user.role)} replace />
}

function SignInGate({ children }: { children: JSX.Element }) {
  const user = getStoredUser()
  if (user) return <Navigate to={roleHome(user.role)} replace />
  return children
}

function PendingGate({ children }: { children: JSX.Element }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/signin" replace />
  if (isApprovedRole(user.role)) return <Navigate to={roleHome(user.role)} replace />
  return children
}

function AdminGate({ children }: { children: JSX.Element }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/signin" replace />
  if (user.role !== 'admin') return <Navigate to={roleHome(user.role)} replace />
  return children
}

function DashboardGate({ requiredRole, children }: { requiredRole?: ApprovedRole; children: JSX.Element }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/signin" replace />

  if (!isApprovedRole(user.role)) return <Navigate to="/pending-approval" replace />

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  return children
}

function RegisterEntry() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const ref = params.get('ref')
  const step = params.get('step')
  if (ref && step !== 'register') return <ReferralCodePage />
  return <Register />
}

function AppLayout() {
  const location = useLocation()
  const hideNavbarRoutes = ['/', '/signin', '/register']
  const hideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/network') ||
    location.pathname.startsWith('/pending-approval') ||
    location.pathname.startsWith('/admin')
  const hideFooterRoutes = ['/signin', '/register']
  const hideFooter = hideFooterRoutes.includes(location.pathname)

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <RoleSync />
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterEntry />} />
          <Route
            path="/signin"
            element={
              <SignInGate>
                <SignIn />
              </SignInGate>
            }
          />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          <Route
            path="/dashboard"
            element={
              <DashboardIndexRedirect />
            }
          />

          <Route
            path="/dashboard/user"
            element={
              <DashboardGate requiredRole="users">
                <UserDashboard />
              </DashboardGate>
            }
          />

          <Route
            path="/dashboard/leader"
            element={
              <DashboardGate requiredRole="leaders">
                <LeaderDashboard />
              </DashboardGate>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <AdminGate>
                <AdminApprovalDashboard />
              </AdminGate>
            }
          />

          <Route
            path="/admin/approvals"
            element={
              <AdminGate>
                <AdminApprovalDashboard />
              </AdminGate>
            }
          />

          <Route
            path="/pending-approval"
            element={
              <PendingGate>
                <PendingApproval />
              </PendingGate>
            }
          />

          <Route
            path="/network"
            element={
              <DashboardGate>
                <NetworkView />
              </DashboardGate>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout />
    </Router>
  )
}

export default App


