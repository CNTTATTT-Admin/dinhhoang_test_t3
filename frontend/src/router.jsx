import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage.jsx'
import CampaignsPage from './pages/CampaignsPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import RequireAdmin from './components/auth/RequireAdmin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminScenariosPage from './pages/admin/AdminScenariosPage.jsx'
import AdminScenarioStepsPage from './pages/admin/AdminScenarioStepsPage.jsx'
import AdminInboxEmailsPage from './pages/admin/AdminInboxEmailsPage.jsx'
import AdminSessionsPage from './pages/admin/AdminSessionsPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import SessionSelector from './pages/SessionSelector.jsx'
import SurvivalInbox from './components/game/SurvivalInbox.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/campaigns',
    element: <CampaignsPage />,
  },
  {
    path: '/leaderboard',
    element: <LeaderboardPage />,
  },
  {
    path: '/handbook',
    element: <ComingSoonPage />,
  },
  {
    path: '/train/survival-inbox',
    element: <SurvivalInbox />,
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminOverview />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/scenarios',
    element: (
      <RequireAdmin>
        <AdminScenariosPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/scenario-steps',
    element: (
      <RequireAdmin>
        <AdminScenarioStepsPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/inbox-emails',
    element: (
      <RequireAdmin>
        <AdminInboxEmailsPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/sessions',
    element: (
      <RequireAdmin>
        <AdminSessionsPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RequireAdmin>
        <AdminUsersPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/campaign/:scenarioId/sessions',
    element: <SessionSelector />,
  },
  {
    path: '/play/:sessionId',
    element: <SurvivalInbox />,
  },
  {
    path: '/debrief/:sessionId',
    element: <Navigate to="/campaigns" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
