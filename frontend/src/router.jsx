import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage.jsx'
import CampaignsPage from './pages/CampaignsPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
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
    element: <ComingSoonPage />,
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
