import React, { useState } from 'react'
import { MapPin, Lock, Unlock, Star, Trophy, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cn } from '../utils/cn'

export default function AdventureMap() {
  const { state } = useApp()
  const { subjects, gamification } = state
  const [selectedNode, setSelectedNode] = useState(null)
  
  // Generate quest nodes based on subjects and chapters
  const generateQuestNodes = () => {
    const nodes = []
    let nodeId = 0
    
    subjects.forEach((subject, subjectIndex) => {
      subject.chapters.forEach((chapter, chapterIndex) => {
        const isCompleted = chapter.completed
        const isUnlocked = chapterIndex === 0 || subject.chapters[chapterIndex - 1].completed
        
        nodes.push({
          id: `node_${nodeId++}`,
          subjectId: subject.id,
          subjectName: subject.name,
          chapterName: chapter.name,
          chapterIndex,
          isCompleted,
          isUnlocked,
          level: Math.floor(chapterIndex / 3) + 1,
          xpReward: 50,
          position: {
            x: (subjectIndex * 200) + (chapterIndex % 3) * 60,
            y: (chapterIndex * 80) + 50
          }
        })
      })
    })
    
    return nodes
  }
  
  const questNodes = generateQuestNodes()
  
  const getNodeStatus = (node) => {
    if (node.isCompleted) return 'completed'
    if (node.isUnlocked) return 'unlocked'
    return 'locked'
  }
  
  const getLevelColor = (level) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-accent-500',
      'bg-red-500'
    ]
    return colors[(level - 1) % colors.length]
  }
  
  const totalProgress = subjects.length > 0 
    ? (subjects.reduce((acc, subject) => {
        const completed = subject.chapters.filter(ch => ch.completed).length
        const total = subject.chapters.length
        return acc + (total > 0 ? (completed / total) * 100 : 0)
      }, 0) / subjects.length)
    : 0
  
  if (subjects.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Adventure Map</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          Add subjects to see your adventure map and quests!
        </p>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Adventure Map</h2>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-500" />
          <span className="text-sm font-semibold text-accent-700">
            Level {gamification.level}
          </span>
        </div>
      </div>
      
      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-primary-700">{Math.round(totalProgress)}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>
      
      {/* Quest Grid */}
      <div className="space-y-6">
        {subjects.map((subject, subjectIndex) => {
          const subjectNodes = questNodes.filter(n => n.subjectId === subject.id)
          const subjectProgress = subject.chapters.filter(ch => ch.completed).length
          
          return (
            <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-accent-500" />
                  <span>{subjectProgress}/{subject.chapters.length} completed</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {subjectNodes.map((node, index) => {
                  const status = getNodeStatus(node)
                  
                  return (
                    <div
                      key={node.id}
                      onClick={() => status !== 'locked' && setSelectedNode(node)}
                      className={cn(
                        'relative p-3 rounded-lg border-2 transition-all cursor-pointer',
                        status === 'completed' && 'bg-green-50 border-green-300',
                        status === 'unlocked' && 'bg-white border-primary-300 hover:border-primary-500 hover:shadow-md',
                        status === 'locked' && 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                      )}
                    >
                      {/* Level Badge */}
                      <div className={cn(
                        'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold',
                        getLevelColor(node.level)
                      )}>
                        {node.level}
                      </div>
                      
                      {/* Icon */}
                      <div className="flex justify-center mb-2">
                        {status === 'completed' ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                        ) : status === 'unlocked' ? (
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <Unlock className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Chapter Name */}
                      <p className="text-xs text-center font-medium text-gray-700 line-clamp-2">
                        {node.chapterName}
                      </p>
                      
                      {/* XP Reward */}
                      {status !== 'completed' && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-accent-500" />
                          <span className="text-xs text-accent-600">+{node.xpReward} XP</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-primary-800">Quest Details</h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-primary-600 hover:text-primary-800"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Subject:</span>
              <span className="text-sm font-medium text-gray-800">{selectedNode.subjectName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Chapter:</span>
              <span className="text-sm font-medium text-gray-800">{selectedNode.chapterName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Level:</span>
              <span className="text-sm font-medium text-gray-800">{selectedNode.level}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Reward:</span>
              <span className="text-sm font-medium text-accent-600">+{selectedNode.xpReward} XP</span>
            </div>
            
            {selectedNode.isCompleted ? (
              <div className="mt-3 p-2 bg-green-100 rounded text-center">
                <span className="text-sm text-green-700 font-medium">✓ Completed!</span>
              </div>
            ) : (
              <div className="mt-3 p-2 bg-primary-100 rounded text-center">
                <span className="text-sm text-primary-700 font-medium">
                  {selectedNode.isUnlocked ? 'Ready to start!' : 'Complete previous chapter to unlock'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-500 rounded-full" />
            <span className="text-gray-600">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full" />
            <span className="text-gray-600">Locked</span>
          </div>
        </div>
      </div>
    </div>
  )
}
