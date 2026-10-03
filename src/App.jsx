import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AcademicYearTracker from './components/AcademicYearTracker'
import CurriculumMapper from './components/CurriculumMapper'
import RoadmapGenerator from './components/RoadmapGenerator'
import AdventureMap from './components/AdventureMap'
import GamificationDashboard from './components/GamificationDashboard'
import Leaderboard from './components/Leaderboard'
import RewardsShop from './components/RewardsShop'
import StudentSetup from './components/StudentSetup'
import StudentDashboard from './components/StudentDashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Map, 
  Trophy, 
  Users, 
  Gift, 
  Menu,
  X,
  GraduationCap,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { cn } from './utils/cn'

function Navigation({ currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, signOut } = useAuth()
  const navItems = [
    { id: 'student-dashboard', label: 'My Dashboard', icon: Home },
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'calendar', label: 'Academic Year', icon: Calendar },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'adventure', label: 'Adventure Map', icon: Trophy },
    { id: 'gamification', label: 'XP & Badges', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'rewards', label: 'Rewards Shop', icon: Gift },
  ]

  const handleLogout = async () => {
    await signOut()
  }
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      {/* Sidebar */}
      <nav className={cn(
        'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 z-40 transition-transform duration-300',
        'lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 mb-8 pt-12 lg:pt-0">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">StudyBuddy</h1>
            <p className="text-xs text-gray-500">Learn & Grow</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  currentView === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

function Dashboard() {
  const { state } = useApp()
  const { gamification, academicYear, subjects, user } = state
  
  const totalChapters = subjects.reduce((acc, subject) => acc + subject.chapters.length, 0)
  const completedChapters = subjects.reduce((acc, subject) => {
    return acc + subject.chapters.filter(ch => ch.completed).length
  }, 0)
  const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0
  
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user.privacyAlias || 'Student'}!
        </h2>
        <p className="text-primary-100 mb-4">
          {academicYear.totalWeeks > 0 
            ? `Week ${academicYear.currentWeek} of ${academicYear.totalWeeks}` 
            : 'Set up your academic year to get started!'}
        </p>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-primary-100">Level</p>
            <p className="text-xl font-bold">{gamification.level}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-primary-100">XP</p>
            <p className="text-xl font-bold">{gamification.xp}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-primary-100">Streak</p>
            <p className="text-xl font-bold">{gamification.streak} days</p>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-600">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-accent-600" />
            <span className="text-sm text-gray-600">Chapters</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{completedChapters}/{totalChapters}</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Badges</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{gamification.badges.length}</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{Math.round(overallProgress)}%</p>
        </div>
      </div>
      
      {/* Setup Prompt */}
      {!academicYear.totalWeeks && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Get Started</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Set up your academic year and add subjects to begin your learning journey!
          </p>
          <button
            onClick={() => state.dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
            className="btn-secondary"
          >
            Set Up Academic Year
          </button>
        </div>
      )}
      
      {/* Quick Actions */}
      {academicYear.totalWeeks && subjects.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => state.dispatch({ type: 'SET_VIEW', payload: 'roadmap' })}
              className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg text-center transition-colors"
            >
              <Map className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">View Roadmap</span>
            </button>
            
            <button
              onClick={() => state.dispatch({ type: 'SET_VIEW', payload: 'adventure' })}
              className="p-4 bg-accent-50 hover:bg-accent-100 rounded-lg text-center transition-colors"
            >
              <Trophy className="w-6 h-6 mx-auto mb-2 text-accent-600" />
              <span className="text-sm font-medium text-accent-700">Adventure Map</span>
            </button>
            
            <button
              onClick={() => state.dispatch({ type: 'SET_VIEW', payload: 'gamification' })}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
            >
              <Trophy className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium text-green-700">XP & Badges</span>
            </button>
            
            <button
              onClick={() => state.dispatch({ type: 'SET_VIEW', payload: 'rewards' })}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
            >
              <Gift className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Rewards Shop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MainContent() {
  const { state, dispatch } = useApp()
  const { user, loading } = useAuth()
  const { currentView } = state
  
  const setCurrentView = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view })
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [showSignup, setShowSignup] = React.useState(false)
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show login/signup if not authenticated
  if (!user) {
    return showSignup ? (
      <Signup onToggleLogin={() => setShowSignup(false)} />
    ) : (
      <Login onToggleSignup={() => setShowSignup(true)} />
    )
  }
  
  const renderContent = () => {
    switch (currentView) {
      case 'student-dashboard':
        return <StudentDashboard />
      case 'dashboard':
        return <Dashboard />
      case 'setup':
        return <StudentSetup />
      case 'calendar':
        return <AcademicYearTracker />
      case 'curriculum':
        return <CurriculumMapper />
      case 'roadmap':
        return <RoadmapGenerator />
      case 'adventure':
        return <AdventureMap />
      case 'gamification':
        return <GamificationDashboard />
      case 'leaderboard':
        return <Leaderboard />
      case 'rewards':
        return <RewardsShop />
      default:
        return <StudentDashboard />
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
