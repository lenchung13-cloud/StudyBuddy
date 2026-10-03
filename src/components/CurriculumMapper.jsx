import React, { useState } from 'react'
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SCHOOL_CURRICULA, SUBJECT_CATEGORIES } from '../data/models'
import { cn } from '../utils/cn'

export default function CurriculumMapper() {
  const { state, dispatch } = useApp()
  const { user, subjects } = state
  
  const [showCustomSubject, setShowCustomSubject] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', category: SUBJECT_CATEGORIES.OTHER, chapters: '' })
  const [expandedSubjects, setExpandedSubjects] = useState({})
  
  const handleCurriculumChange = (curriculum) => {
    dispatch({ type: 'SET_CURRICULUM', payload: curriculum })
  }
  
  const handleAddCustomSubject = () => {
    if (newSubject.name && newSubject.chapters) {
      const chapterArray = newSubject.chapters.split(',').map(c => c.trim()).filter(c => c)
      const customSubject = {
        id: `custom_${Date.now()}`,
        name: newSubject.name,
        category: newSubject.category,
        chapters: chapterArray
      }
      
      dispatch({ type: 'ADD_CUSTOM_SUBJECT', payload: customSubject })
      dispatch({ type: 'SET_CURRICULUM', payload: SCHOOL_CURRICULA.CUSTOM })
      
      setNewSubject({ name: '', category: SUBJECT_CATEGORIES.OTHER, chapters: '' })
      setShowCustomSubject(false)
    }
  }
  
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }))
  }
  
  const handleCompleteChapter = (subjectId, chapterIndex) => {
    dispatch({ 
      type: 'COMPLETE_CHAPTER', 
      payload: { subjectId, chapterIndex } 
    })
  }
  
  const getSubjectProgress = (subject) => {
    const completed = subject.chapters.filter(ch => ch.completed).length
    const total = subject.chapters.length
    return total > 0 ? (completed / total) * 100 : 0
  }
  
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-bold text-gray-800">Curriculum & Subjects</h2>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Curriculum
        </label>
        <select
          value={user.curriculum}
          onChange={(e) => handleCurriculumChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value={SCHOOL_CURRICULA.UNHCR}>UNHCR Guidelines</option>
          <option value={SCHOOL_CURRICULA.IGCSE}>IGCSE</option>
          <option value={SCHOOL_CURRICULA.LOCAL}>Local Standards</option>
          <option value={SCHOOL_CURRICULA.CUSTOM}>Custom</option>
        </select>
      </div>
      
      {user.curriculum === SCHOOL_CURRICULA.CUSTOM && (
        <div className="mb-6">
          <button
            onClick={() => setShowCustomSubject(!showCustomSubject)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Subject
          </button>
          
          {showCustomSubject && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g., Advanced Mathematics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newSubject.category}
                  onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.values(SUBJECT_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapters (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSubject.chapters}
                  onChange={(e) => setNewSubject({ ...newSubject, chapters: e.target.value })}
                  placeholder="e.g., Algebra, Geometry, Statistics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleAddCustomSubject}
                className="btn-primary w-full"
              >
                Add Subject
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Your Subjects</h3>
        
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No subjects added yet. Select a curriculum to get started.
          </p>
        ) : (
          subjects.map(subject => {
            const progress = getSubjectProgress(subject)
            const isExpanded = expandedSubjects[subject.id]
            
            return (
              <div key={subject.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleSubject(subject.id)}
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {subject.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 ml-4" />
                  )}
                </div>
                
                {isExpanded && (
                  <div className="p-4 space-y-2">
                    {subject.chapters.map((chapter, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg transition-colors',
                          chapter.completed 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-white border border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                              chapter.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300'
                            )}
                          >
                            {chapter.completed && '✓'}
                          </div>
                          <span className={cn(
                            'text-sm',
                            chapter.completed ? 'text-green-700 line-through' : 'text-gray-700'
                          )}>
                            {chapter.name}
                          </span>
                        </div>
                        
                        {!chapter.completed && (
                          <button
                            onClick={() => handleCompleteChapter(subject.id, index)}
                            className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-full transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
