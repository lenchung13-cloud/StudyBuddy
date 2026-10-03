import React, { useEffect } from 'react'
import { Map, Target, CheckCircle, Circle, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cn } from '../utils/cn'

export default function RoadmapGenerator() {
  const { state, dispatch } = useApp()
  const { academicYear, subjects, roadmap } = state
  
  useEffect(() => {
    if (academicYear.totalWeeks > 0 && subjects.length > 0) {
      generateRoadmap()
    }
  }, [academicYear, subjects])
  
  const generateRoadmap = () => {
    const weeksRemaining = academicYear.totalWeeks - academicYear.currentWeek
    if (weeksRemaining <= 0 || subjects.length === 0) return
    
    // Get all incomplete chapters
    const incompleteChapters = []
    subjects.forEach(subject => {
      subject.chapters.forEach((chapter, index) => {
        if (!chapter.completed) {
          incompleteChapters.push({
            subjectId: subject.id,
            subjectName: subject.name,
            chapterIndex: index,
            chapterName: chapter.name
          })
        }
      })
    })
    
    // Calculate chapters per week
    const chaptersPerWeek = Math.ceil(incompleteChapters.length / weeksRemaining)
    
    // Generate weekly goals
    const weeklyGoals = []
    for (let week = academicYear.currentWeek; week <= academicYear.totalWeeks; week++) {
      const startIndex = (week - academicYear.currentWeek) * chaptersPerWeek
      const weekChapters = incompleteChapters.slice(startIndex, startIndex + chaptersPerWeek)
      
      if (weekChapters.length > 0) {
        weeklyGoals.push({
          week,
          chapters: weekChapters,
          completed: week < academicYear.currentWeek,
          progress: 0
        })
      }
    }
    
    // Generate daily tasks for current week
    const currentWeekGoals = weeklyGoals.find(w => w.week === academicYear.currentWeek)
    const dailyTasks = currentWeekGoals 
      ? generateDailyTasks(currentWeekGoals.chapters)
      : []
    
    dispatch({
      type: 'GENERATE_ROADMAP',
      payload: { weeklyGoals, dailyTasks }
    })
  }
  
  const generateDailyTasks = (weekChapters) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const tasksPerDay = Math.ceil(weekChapters.length / 5) // 5 study days
    
    return days.map((day, index) => {
      const startIndex = index * tasksPerDay
      const dayChapters = weekChapters.slice(startIndex, startIndex + tasksPerDay)
      
      return {
        day,
        chapters: dayChapters,
        completed: false
      }
    }).filter(task => task.chapters.length > 0)
  }
  
  const getWeekStatus = (weekGoal) => {
    if (weekGoal.week < academicYear.currentWeek) return 'completed'
    if (weekGoal.week === academicYear.currentWeek) return 'current'
    return 'upcoming'
  }
  
  if (!academicYear.totalWeeks) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Map className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Your Learning Roadmap</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          Set up your academic year and add subjects to generate your personalized roadmap.
        </p>
      </div>
    )
  }
  
  if (subjects.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Map className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Your Learning Roadmap</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          Add subjects to generate your personalized learning roadmap.
        </p>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Your Learning Roadmap</h2>
        </div>
        <button
          onClick={generateRoadmap}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Refresh
        </button>
      </div>
      
      {/* Current Week Focus */}
      {roadmap.weeklyGoals.length > 0 && (
        <div className="mb-6 p-4 bg-accent-50 rounded-lg border border-accent-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-accent-600" />
            <h3 className="font-semibold text-accent-800">This Week's Goals</h3>
          </div>
          
          {roadmap.weeklyGoals
            .filter(w => w.week === academicYear.currentWeek)
            .map(weekGoal => (
              <div key={weekGoal.week} className="space-y-2">
                {weekGoal.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Circle className="w-4 h-4 text-accent-500" />
                    <span className="text-accent-900">
                      <strong>{chapter.subjectName}</strong> - {chapter.chapterName}
                    </span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
      
      {/* Weekly Overview */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Weekly Overview</h3>
        
        {roadmap.weeklyGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No roadmap generated yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {roadmap.weeklyGoals.map(weekGoal => {
              const status = getWeekStatus(weekGoal)
              
              return (
                <div
                  key={weekGoal.week}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    status === 'completed' && 'bg-green-50 border-green-200',
                    status === 'current' && 'bg-accent-50 border-accent-200',
                    status === 'upcoming' && 'bg-white border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : status === 'current' ? (
                        <Target className="w-5 h-5 text-accent-500" />
                      ) : (
                        <Calendar className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-800">
                        Week {weekGoal.week}
                      </span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      status === 'completed' && 'bg-green-100 text-green-800',
                      status === 'current' && 'bg-accent-100 text-accent-800',
                      status === 'upcoming' && 'bg-gray-100 text-gray-800'
                    )}>
                      {status === 'completed' ? 'Completed' : status === 'current' ? 'Current' : 'Upcoming'}
                    </span>
                  </div>
                  
                  <div className="text-smspace-y-1">
                    {weekGoal.chapters.slice(0, 3).map((chapter, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {chapter.subjectName} - {chapter.chapterName}
                      </div>
                    ))}
                    {weekGoal.chapters.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{weekGoal.chapters.length - 3} more chapters
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Daily Tasks for Current Week */}
      {roadmap.dailyTasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Daily Tasks This Week</h3>
          <div className="space-y-2">
            {roadmap.dailyTasks.map((task, index) => (
              <div
                key={index}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-800">{task.day}</span>
                </div>
                <div className="space-y-1">
                  {task.chapters.map((chapter, idx) => (
                    <div key={idx} className="text-xs text-gray-600 pl-6">
                      • {chapter.chapterName} ({chapter.subjectName})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
