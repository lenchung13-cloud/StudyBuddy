import React, { useEffect } from 'react'
import { Award, Flame, Zap, TrendingUp, Target, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { BADGE_TYPES } from '../data/models'
import { cn } from '../utils/cn'

export default function GamificationDashboard() {
  const { state, dispatch } = useApp()
  const { gamification, subjects } = state
  
  useEffect(() => {
    checkBadges()
  }, [gamification.xp, gamification.streak, subjects])
  
  const checkBadges = () => {
    const newBadges = []
    
    // Check Streak Survivor badge
    if (gamification.streak >= 7) {
      const streakBadge = BADGE_TYPES.STREAK_SURVIVOR
      if (!gamification.badges.find(b => b.id === streakBadge.id)) {
        newBadges.push(streakBadge)
      }
    }
    
    // Check Chapter Master badge
    const totalCompleted = subjects.reduce((acc, subject) => {
      return acc + subject.chapters.filter(ch => ch.completed).length
    }, 0)
    
    if (totalCompleted >= 10) {
      const chapterBadge = BADGE_TYPES.CHAPTER_MASTER
      if (!gamification.badges.find(b => b.id === chapterBadge.id)) {
        newBadges.push(chapterBadge)
      }
    }
    
    // Award new badges
    newBadges.forEach(badge => {
      dispatch({ type: 'ADD_BADGE', payload: badge })
    })
  }
  
  const xpToNextLevel = gamification.level * 500
  const xpProgress = (gamification.xp % 500) / 5
  const xpInCurrentLevel = gamification.xp % 500
  
  const getBadgeStatus = (badge) => {
    const hasBadge = gamification.badges.find(b => b.id === badge.id)
    
    if (hasBadge) return 'earned'
    
    // Check if requirements are met
    if (badge.id === 'streak_survivor' && gamification.streak >= badge.requirement) return 'available'
    if (badge.id === 'chapter_master') {
      const totalCompleted = subjects.reduce((acc, subject) => {
        return acc + subject.chapters.filter(ch => ch.completed).length
      }, 0)
      if (totalCompleted >= badge.requirement) return 'available'
    }
    
    return 'locked'
  }
  
  const getProgressForBadge = (badge) => {
    if (badge.id === 'streak_survivor') {
      return Math.min((gamification.streak / badge.requirement) * 100, 100)
    }
    if (badge.id === 'chapter_master') {
      const totalCompleted = subjects.reduce((acc, subject) => {
        return acc + subject.chapters.filter(ch => ch.completed).length
      }, 0)
      return Math.min((totalCompleted / badge.requirement) * 100, 100)
    }
    return 0
  }
  
  return (
    <div className="space-y-6">
      {/* XP & Level Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-accent-500" />
          <h2 className="text-xl font-bold text-gray-800">XP & Level</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-4 rounded-lg text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-accent-600" />
            <p className="text-2xl font-bold text-accent-800">{gamification.xp}</p>
            <p className="text-sm text-accent-600">Total XP</p>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="text-2xl font-bold text-primary-800">{gamification.level}</p>
            <p className="text-sm text-primary-600">Level</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-800">{gamification.streak}</p>
            <p className="text-sm text-orange-600">Day Streak</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Level {gamification.level} Progress</span>
            <span>{xpInCurrentLevel} / 500 XP</span>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {500 - xpInCurrentLevel} XP to Level {gamification.level + 1}
          </p>
        </div>
      </div>
      
      {/* Streak Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-800">Learning Streak</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-orange-600">{gamification.streak}</div>
            <div>
              <p className="text-gray-700 font-medium">Day Streak</p>
              <p className="text-sm text-gray-500">Keep learning to maintain your streak!</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  i < gamification.streak
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        {gamification.streak >= 7 && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">
              Amazing! You've earned the Streak Survivor badge!
            </span>
          </div>
        )}
      </div>
      
      {/* Badges Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Badges</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(BADGE_TYPES).map(badge => {
            const status = getBadgeStatus(badge)
            const progress = getProgressForBadge(badge)
            
            return (
              <div
                key={badge.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  status === 'earned' && 'bg-green-50 border-green-300',
                  status === 'available' && 'bg-primary-50 border-primary-300',
                  status === 'locked' && 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{badge.icon}</div>
                  {status === 'locked' && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{badge.description}</p>
                
                {status === 'earned' ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Earned!</span>
                  </div>
                ) : (
                  <div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {status === 'available' ? 'Ready to claim!' : `${Math.round(progress)}% complete`}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {gamification.badges.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Earned Badges ({gamification.badges.length})</h3>
            <div className="flex flex-wrap gap-3">
              {gamification.badges.map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-sm font-medium text-green-800">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* XP Earning Tips */}
      <div className="card bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Earn XP</h2>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span className="text-gray-700">Complete a chapter</span>
            <span className="font-semibold text-accent-600">+50 XP</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span className="text-gray-700">Maintain daily streak</span>
            <span className="font-semibold text-accent-600">+10 XP/day</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span className="text-gray-700">Complete weekly goals</span>
            <span className="font-semibold text-accent-600">+100 XP</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span className="text-gray-700">Earn a badge</span>
            <span className="font-semibold text-accent-600">+200 XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}
