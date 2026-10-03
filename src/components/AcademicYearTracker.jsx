import React, { useState } from 'react'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cn } from '../utils/cn'

export default function AcademicYearTracker() {
  const { state, dispatch } = useApp()
  const { academicYear } = state
  
  const [startDate, setStartDate] = useState(academicYear.startDate || '')
  const [endDate, setEndDate] = useState(academicYear.endDate || '')
  
  const calculateWeeks = (start, end) => {
    if (!start || !end) return 0
    const start_date = new Date(start)
    const end_date = new Date(end)
    const diffTime = Math.abs(end_date - start_date)
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }
  
  const getCurrentWeek = (start, end) => {
    if (!start || !end) return 0
    const now = new Date()
    const start_date = new Date(start)
    const end_date = new Date(end)
    
    if (now < start_date) return 0
    if (now > end_date) return calculateWeeks(start, end)
    
    const diffTime = now - start_date
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  }
  
  const handleSave = () => {
    const totalWeeks = calculateWeeks(startDate, endDate)
    const currentWeek = getCurrentWeek(startDate, endDate)
    
    dispatch({
      type: 'SET_ACADEMIC_YEAR',
      payload: {
        startDate,
        endDate,
        totalWeeks,
        currentWeek
      }
    })
  }
  
  const progressPercentage = academicYear.totalWeeks > 0 
    ? (academicYear.currentWeek / academicYear.totalWeeks) * 100 
    : 0
  
  const renderTimeline = () => {
    if (!academicYear.totalWeeks) return null
    
    const weeks = []
    for (let i = 0; i < academicYear.totalWeeks; i++) {
      const isCurrent = i === academicYear.currentWeek - 1
      const isPast = i < academicYear.currentWeek - 1
      const isFuture = i > academicYear.currentWeek - 1
      
      weeks.push(
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            isPast && 'bg-primary-500',
            isCurrent && 'bg-accent-500 scale-110',
            isFuture && 'bg-gray-200'
          )}
          style={{ width: `${100 / academicYear.totalWeeks}%` }}
          title={`Week ${i + 1}`}
        />
      )
    }
    return weeks
  }
  
  if (!academicYear.startDate) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Set Your Academic Year</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {startDate && endDate && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Total Weeks:</strong> {calculateWeeks(startDate, endDate)}
              </p>
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={!startDate || !endDate}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Academic Year
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Academic Year Progress</h2>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_ACADEMIC_YEAR', payload: { startDate: null, endDate: null, totalWeeks: 0, currentWeek: 0 } })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Edit
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <p className="text-2xl font-bold text-primary-800">{academicYear.currentWeek}</p>
          <p className="text-sm text-primary-600">Current Week</p>
        </div>
        
        <div className="bg-accent-50 p-4 rounded-lg text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent-600" />
          <p className="text-2xl font-bold text-accent-800">{academicYear.totalWeeks}</p>
          <p className="text-sm text-accent-600">Total Weeks</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold text-green-800">{academicYear.totalWeeks - academicYear.currentWeek}</p>
          <p className="text-sm text-green-600">Weeks Remaining</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          {renderTimeline()}
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>
          <strong>Start:</strong> {new Date(academicYear.startDate).toLocaleDateString()}
        </p>
        <p>
          <strong>End:</strong> {new Date(academicYear.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
