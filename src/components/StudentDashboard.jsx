import React, { useState, useEffect } from 'react'
import { User, Clock, Flame, Award, Plus, X, Calendar, TrendingUp } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function StudentDashboard() {
  const [showLogModal, setShowLogModal] = useState(false)
  const [studyMinutes, setStudyMinutes] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  
  const [userData, setUserData] = useState({
    name: 'Student',
    avatar: '🎓',
    todayGoal: 120, // 2 hours in minutes
    todayProgress: 45,
    streak: 5,
    badges: [
      { id: 1, name: 'First Steps', icon: '🚀', earned: true },
      { id: 2, name: 'Week Warrior', icon: '⚔️', earned: true },
      { id: 3, name: 'Chapter Master', icon: '📚', earned: false },
      { id: 4, name: 'Streak Champion', icon: '🔥', earned: false }
    ]
  })

  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [45, 60, 30, 90, 120, 75, 0]
  })

  const [monthlyProgress, setMonthlyProgress] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [280, 350, 420, 380]
  })

  const progressPercentage = Math.round((userData.todayProgress / userData.todayGoal) * 100)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  const handleLogStudy = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/progress/study-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current-user-id',
          subject_id: selectedSubject,
          chapter_id: selectedChapter,
          minutes: studyMinutes,
          date: new Date().toISOString().split('T')[0],
          completed,
          notes: ''
        })
      })
      
      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          todayProgress: prev.todayProgress + studyMinutes
        }))
        setShowLogModal(false)
        setStudyMinutes(0)
        setCompleted(false)
      }
    } catch (error) {
      console.error('Failed to log study time:', error)
    }
  }

  const barChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Minutes Studied',
        data: weeklyData.data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(209, 213, 219, 0.5)'
        ],
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  }

  const lineChartData = {
    labels: monthlyProgress.labels,
    datasets: [
      {
        label: 'Weekly Study Minutes',
        data: monthlyProgress.data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              {userData.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {userData.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Let's make today productive!</p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Study Time
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Goal */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Goal</p>
                  <p className="text-2xl font-bold text-gray-900">2 hours</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{progressPercentage}%</p>
                    <p className="text-xs text-gray-600">{userData.todayProgress} min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Current Streak</p>
                <p className="text-3xl font-bold">{userData.streak} days</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < userData.streak ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-white/80 mt-3">
              {userData.streak >= 7 ? '🔥 On fire! Keep it up!' : 'Keep going to build your streak!'}
            </p>
          </div>

          {/* Recent Badges */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Badges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userData.badges.filter(b => b.earned).length}/4
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {userData.badges.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl text-center ${
                    badge.earned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                <p className="text-sm text-gray-600">Daily study minutes</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Weekly Progress Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Monthly Progress</h3>
                <p className="text-sm text-gray-600">Weekly study trends</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Log Study Time Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Log Study Time</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Minutes
                </label>
                <input
                  type="number"
                  value={studyMinutes}
                  onChange={(e) => setStudyMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter minutes studied"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select subject</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="completed"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="completed" className="text-sm text-gray-700">
                  Mark chapter as completed
                </label>
              </div>

              <button
                onClick={handleLogStudy}
                disabled={studyMinutes === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Log Study Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
