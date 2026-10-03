import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  SCHOOL_CURRICULA, 
  DEFAULT_SUBJECTS, 
  BADGE_TYPES,
  AVATAR_REWARDS,
  FRAME_REWARDS,
  THEME_REWARDS,
  CERTIFICATE_TEMPLATES
} from '../data/models'

const AppContext = createContext()

const initialState = {
  // User profile
  user: {
    name: '',
    school: '',
    curriculum: SCHOOL_CURRICULA.CUSTOM,
    privacyAlias: '',
    avatar: 'avatar_1',
    frame: null,
    theme: null,
    joinedDate: new Date().toISOString()
  },
  
  // Academic calendar
  academicYear: {
    startDate: null,
    endDate: null,
    totalWeeks: 0,
    currentWeek: 0
  },
  
  // Subjects and curriculum
  subjects: [],
  customSubjects: [],
  
  // Progress tracking
  progress: {
    completedChapters: [],
    weeklyGoals: [],
    currentWeekProgress: 0
  },
  
  // Gamification
  gamification: {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    badges: [],
    unlockedRewards: {
      avatars: ['avatar_1'],
      frames: [],
      themes: [],
      certificates: []
    }
  },
  
  // Roadmap
  roadmap: {
    weeklyGoals: [],
    dailyTasks: []
  },
  
  // Leaderboard (mock data)
  leaderboard: [],
  
  // UI state
  currentView: 'dashboard',
  setupComplete: false
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    
    case 'SET_ACADEMIC_YEAR':
      return { 
        ...state, 
        academicYear: { ...state.academicYear, ...action.payload },
        setupComplete: true
      }
    
    case 'SET_CURRICULUM':
      const curriculum = action.payload
      let subjects = []
      
      if (curriculum === SCHOOL_CURRICULA.CUSTOM) {
        subjects = state.customSubjects
      } else {
        subjects = DEFAULT_SUBJECTS[curriculum] || []
      }
      
      return { 
        ...state, 
        user: { ...state.user, curriculum },
        subjects: subjects.map(s => ({
          ...s,
          chapters: s.chapters.map(ch => ({ name: ch, completed: false }))
        }))
      }
    
    case 'ADD_CUSTOM_SUBJECT':
      return {
        ...state,
        customSubjects: [...state.customSubjects, action.payload]
      }
    
    case 'COMPLETE_CHAPTER':
      const { subjectId, chapterIndex } = action.payload
      const updatedSubjects = state.subjects.map(subject => {
        if (subject.id === subjectId) {
          const updatedChapters = [...subject.chapters]
          updatedChapters[chapterIndex] = { 
            ...updatedChapters[chapterIndex], 
            completed: true 
          }
          return { ...subject, chapters: updatedChapters }
        }
        return subject
      })
      
      // Add XP
      const xpGained = 50
      const newXP = state.gamification.xp + xpGained
      const newLevel = Math.floor(newXP / 500) + 1
      
      return {
        ...state,
        subjects: updatedSubjects,
        progress: {
          ...state.progress,
          completedChapters: [...state.progress.completedChapters, { subjectId, chapterIndex }]
        },
        gamification: {
          ...state.gamification,
          xp: newXP,
          level: newLevel
        }
      }
    
    case 'UPDATE_STREAK':
      const today = new Date().toDateString()
      const lastActive = state.gamification.lastActiveDate
      
      if (lastActive !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastActive === yesterday.toDateString()) {
          return {
            ...state,
            gamification: {
              ...state.gamification,
              streak: state.gamification.streak + 1,
              lastActiveDate: today
            }
          }
        } else {
          return {
            ...state,
            gamification: {
              ...state.gamification,
              streak: 1,
              lastActiveDate: today
            }
          }
        }
      }
      return state
    
    case 'ADD_BADGE':
      return {
        ...state,
        gamification: {
          ...state.gamification,
          badges: [...state.gamification.badges, action.payload]
        }
      }
    
    case 'UNLOCK_REWARD':
      const { type, itemId } = action.payload
      const rewardCost = getRewardCost(type, itemId)
      
      if (state.gamification.xp >= rewardCost) {
        const category = type === 'avatar' ? 'avatars' : type === 'frame' ? 'frames' : 'themes'
        return {
          ...state,
          gamification: {
            ...state.gamification,
            xp: state.gamification.xp - rewardCost,
            unlockedRewards: {
              ...state.gamification.unlockedRewards,
              [category]: [...state.gamification.unlockedRewards[category], itemId]
            }
          }
        }
      }
      return state
    
    case 'EQUIP_REWARD':
      return {
        ...state,
        user: { ...state.user, [action.payload.type]: action.payload.itemId }
      }
    
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }
    
    case 'GENERATE_ROADMAP':
      return {
        ...state,
        roadmap: action.payload
      }
    
    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.payload }
    
    default:
      return state
  }
}

function getRewardCost(type, itemId) {
  if (type === 'avatar') {
    const reward = AVATAR_REWARDS.find(r => r.id === itemId)
    return reward ? reward.cost : 0
  } else if (type === 'frame') {
    const reward = FRAME_REWARDS.find(r => r.id === itemId)
    return reward ? reward.cost : 0
  } else if (type === 'theme') {
    const reward = THEME_REWARDS.find(r => r.id === itemId)
    return reward ? reward.cost : 0
  }
  return 0
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('studybuddy_state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        dispatch({ type: 'SET_USER', payload: parsed.user })
        dispatch({ type: 'SET_ACADEMIC_YEAR', payload: parsed.academicYear })
        if (parsed.user.curriculum) {
          dispatch({ type: 'SET_CURRICULUM', payload: parsed.user.curriculum })
        }
        dispatch({ type: 'SET_VIEW', payload: parsed.currentView || 'dashboard' })
      } catch (e) {
        console.error('Error loading saved state:', e)
      }
    }
  }, [])
  
  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('studybuddy_state', JSON.stringify(state))
  }, [state])
  
  // Check streak on mount
  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])
  
  const value = {
    state,
    dispatch
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
