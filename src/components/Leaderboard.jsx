import React, { useEffect } from 'react'
import { Trophy, Medal, Crown, Shield, TrendingUp, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cn } from '../utils/cn'

// Generate privacy aliases
const generatePrivacyAlias = () => {
  const adjectives = ['Brave', 'Swift', 'Wise', 'Bright', 'Kind', 'Bold', 'Calm', 'Eager']
  const animals = ['Lion', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Hawk', 'Bear', 'Tiger']
  const numbers = Math.floor(Math.random() * 99) + 1
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  
  return `${adj}${animal}${numbers}`
}

// Mock leaderboard data
const generateMockLeaderboard = (currentUserXP, currentUserAlias) => {
  const mockUsers = [
    { alias: 'BraveLion42', xp: 3500, level: 7, school: 'Springfield Academy' },
    { alias: 'SwiftEagle15', xp: 2800, level: 6, school: 'Lincoln High' },
    { alias: 'WiseDolphin88', xp: 2400, level: 5, school: 'Oak Ridge School' },
    { alias: 'BrightFox33', xp: 2100, level: 4, school: 'Maple Grove' },
    { alias: 'KindWolf67', xp: 1800, level: 4, school: 'Pine Valley' },
    { alias: 'BoldHawk91', xp: 1500, level: 3, school: 'Cedar Ridge' },
    { alias: 'CalmBear24', xp: 1200, level: 3, school: 'Elmwood Academy' },
    { alias: 'EagerTiger56', xp: 900, level: 2, school: 'Birchwood School' },
  ]
  
  // Add current user
  mockUsers.push({
    alias: currentUserAlias || 'AnonymousStudent',
    xp: currentUserXP,
    level: Math.floor(currentUserXP / 500) + 1,
    school: 'Your School',
    isCurrentUser: true
  })
  
  // Sort by XP
  return mockUsers.sort((a, b) => b.xp - a.xp)
}

export default function Leaderboard() {
  const { state, dispatch } = useApp()
  const { gamification, user, leaderboard } = state
  
  useEffect(() => {
    // Generate or update leaderboard
    const alias = user.privacyAlias || generatePrivacyAlias()
    const mockLeaderboard = generateMockLeaderboard(gamification.xp, alias)
    
    if (!user.privacyAlias) {
      dispatch({ type: 'SET_USER', payload: { privacyAlias: alias } })
    }
    
    dispatch({ type: 'SET_LEADERBOARD', payload: mockLeaderboard })
  }, [gamification.xp])
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }
  
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300'
      default:
        return 'bg-white border-gray-200'
    }
  }
  
  const currentUserRank = leaderboard.findIndex(u => u.isCurrentUser) + 1
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-accent-500" />
          <h2 className="text-xl font-bold text-gray-800">School Leaderboard</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{leaderboard.length} students</span>
        </div>
      </div>
      
      {/* Privacy Notice */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Privacy Protected</p>
          <p className="text-blue-600">Your identity is protected with a privacy alias. Only your teachers can see your real name.</p>
        </div>
      </div>
      
      {/* Your Alias */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Your Privacy Alias</p>
            <p className="text-lg font-bold text-primary-800">{user.privacyAlias || 'Generating...'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Rank</p>
            <p className="text-2xl font-bold text-accent-600">#{currentUserRank}</p>
          </div>
        </div>
      </div>
      
      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.map((student, index) => {
          const rank = index + 1
          const isCurrentUser = student.isCurrentUser
          
          return (
            <div
              key={student.alias}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                getRankStyle(rank),
                isCurrentUser && 'ring-2 ring-primary-500 ring-offset-2'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  {getRankIcon(rank)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-semibold',
                      isCurrentUser ? 'text-primary-700' : 'text-gray-800'
                    )}>
                      {student.alias}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{student.school}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">Level {student.level}</p>
                  <p className="text-xs text-gray-500">{student.xp} XP</p>
                </div>
                
                <TrendingUp className={cn(
                  'w-5 h-5',
                  rank <= 3 ? 'text-accent-500' : 'text-gray-400'
                )} />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Leaderboard Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-4">Leaderboard Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <Crown className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold text-yellow-700">
              {leaderboard[0]?.xp || 0}
            </p>
            <p className="text-xs text-yellow-600">Top Score</p>
          </div>
          
          <div className="bg-primary-50 p-3 rounded-lg text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary-500" />
            <p className="text-lg font-bold text-primary-700">
              {leaderboard.reduce((acc, u) => acc + u.xp, 0)}
            </p>
            <p className="text-xs text-primary-600">Total XP</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold text-green-700">
              {leaderboard.length}
            </p>
            <p className="text-xs text-green-600">Students</p>
          </div>
          
          <div className="bg-accent-50 p-3 rounded-lg text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-accent-500" />
            <p className="text-lg font-bold text-accent-700">
              {Math.round(leaderboard.reduce((acc, u) => acc + u.xp, 0) / leaderboard.length)}
            </p>
            <p className="text-xs text-accent-600">Avg XP</p>
          </div>
        </div>
      </div>
      
      {/* Weekly Challenge */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Weekly Challenge</h3>
        </div>
        <p className="text-sm text-purple-700 mb-3">
          Complete 5 chapters this week to earn bonus XP and climb the leaderboard!
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-1/3" />
          </div>
          <span className="text-xs text-purple-600 font-medium">1/5 completed</span>
        </div>
      </div>
    </div>
  )
}
