import React, { useState, useEffect } from 'react'
import { GraduationCap, Calendar, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '../utils/cn'

const GRADE_LEVELS = Array.from({ length: 10 }, (_, i) => i + 1)

export default function StudentSetup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [schools, setSchools] = useState([])
  const [subjects, setSubjects] = useState([])
  
  const [formData, setFormData] = useState({
    school_id: '',
    grade_level: '',
    academic_year_id: '',
    start_date: '',
    end_date: '',
    selected_subjects: [],
    subject_chapters: {}
  })

  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchSchools()
    fetchSubjects()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schools')
      const data = await response.json()
      setSchools(data)
    } catch (error) {
      console.error('Failed to fetch schools:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      selected_subjects: prev.selected_subjects.includes(subjectId)
        ? prev.selected_subjects.filter(id => id !== subjectId)
        : [...prev.selected_subjects, subjectId]
    }))
  }

  const handleChapterChange = (subjectId, chapters) => {
    setFormData(prev => ({
      ...prev,
      subject_chapters: {
        ...prev.subject_chapters,
        [subjectId]: chapters
      }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create academic year
      const academicYearResponse = await fetch('http://localhost:5000/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: formData.school_id,
          year_name: `${new Date(formData.start_date).getFullYear()}/${new Date(formData.end_date).getFullYear()}`,
          start_date: formData.start_date,
          end_date: formData.end_date
        })
      })
      const academicYear = await academicYearResponse.json()

      // Update student profile
      const profileResponse = await fetch('http://localhost:5000/api/users/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: formData.school_id,
          grade_level: formData.grade_level,
          academic_year_id: academicYear.id
        })
      })

      // Add subjects with chapters
      for (const subjectId of formData.selected_subjects) {
        const chapters = formData.subject_chapters[subjectId]?.split(',').map(c => c.trim()).filter(c => c) || []
        await fetch('http://localhost:5000/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id: formData.school_id,
            name: subjects.find(s => s.id === subjectId)?.name,
            description: '',
            chapters: chapters.map((name, index) => ({ name, description: '' }))
          })
        })
      }

      setSummary({
        school_name: schools.find(s => s.id === formData.school_id)?.name,
        grade_level: formData.grade_level,
        academic_year: academicYear.year_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        subjects_count: formData.selected_subjects.length
      })
      setStep(3)
    } catch (error) {
      console.error('Setup failed:', error)
      alert('Failed to complete setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysRemaining = () => {
    if (!formData.end_date) return 0
    const end = new Date(formData.end_date)
    const today = new Date()
    const diffTime = end - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <GraduationCap className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Welcome to StudyBuddy</h1>
            <p className="text-gray-600 mt-2">Let's set up your learning journey</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                  step >= stepNum ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && <div className={cn(
                  "w-16 h-1 mx-2",
                  step > stepNum ? "bg-indigo-600" : "bg-gray-200"
                )} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School
                </label>
                <select
                  value={formData.school_id}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your grade</option>
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year Start
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year End
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.school_id || !formData.grade_level || !formData.start_date || !formData.end_date}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Subjects You're Studying
                </label>
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selected_subjects.includes(subject.id)}
                          onChange={() => handleSubjectToggle(subject.id)}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium">{subject.name}</span>
                      </label>
                      
                      {formData.selected_subjects.includes(subject.id) && (
                        <div className="mt-3 ml-8">
                          <label className="block text-sm text-gray-600 mb-2">
                            Current chapters (comma separated)
                          </label>
                          <textarea
                            value={formData.subject_chapters[subject.id] || ''}
                            onChange={(e) => handleChapterChange(subject.id, e.target.value)}
                            placeholder="e.g., Chapter 1, Chapter 2, Chapter 3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows="2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formData.selected_subjects.length === 0 || loading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && summary && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-center text-green-800 mb-4">
                  Setup Complete!
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">School:</span>
                    <span className="font-semibold">{summary.school_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade Level:</span>
                    <span className="font-semibold">Grade {summary.grade_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Year:</span>
                    <span className="font-semibold">{summary.academic_year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {summary.start_date} to {summary.end_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-semibold">{summary.subjects_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Remaining:</span>
                    <span className="font-semibold text-indigo-600">{calculateDaysRemaining()} days</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <BookOpen className="w-6 h-6" />
                Start Studying
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
