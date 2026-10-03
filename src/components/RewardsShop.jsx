import React, { useState } from 'react'
import { Gift, Lock, Check, Download, Sparkles, Palette, User, Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AVATAR_REWARDS, FRAME_REWARDS, THEME_REWARDS, CERTIFICATE_TEMPLATES } from '../data/models'
import { cn } from '../utils/cn'
import jsPDF from 'jspdf'

export default function RewardsShop() {
  const { state, dispatch } = useApp()
  const { gamification, user, subjects } = state
  const [activeTab, setActiveTab] = useState('avatars')
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  
  const canAfford = (cost) => gamification.xp >= cost
  
  const isUnlocked = (type, itemId) => {
    const category = type === 'avatar' ? 'avatars' : type === 'frame' ? 'frames' : 'themes'
    return gamification.unlockedRewards[category]?.includes(itemId)
  }
  
  const isEquipped = (type, itemId) => {
    if (type === 'avatar') return user.avatar === itemId
    if (type === 'frame') return user.frame === itemId
    if (type === 'theme') return user.theme === itemId
    return false
  }
  
  const handleUnlock = (type, itemId, cost) => {
    if (canAfford(cost)) {
      dispatch({ type: 'UNLOCK_REWARD', payload: { type, itemId } })
    }
  }
  
  const handleEquip = (type, itemId) => {
    dispatch({ type: 'EQUIP_REWARD', payload: { type, itemId } })
  }
  
  const generateCertificate = (template) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Certificate background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 297, 210, 'F')
    
    // Border
    doc.setDrawColor(14, 165, 233)
    doc.setLineWidth(2)
    doc.rect(10, 10, 277, 190, 'S')
    
    // Inner border
    doc.setDrawColor(251, 191, 36)
    doc.setLineWidth(1)
    doc.rect(15, 15, 267, 180, 'S')
    
    // Title
    doc.setFontSize(32)
    doc.setTextColor(14, 165, 233)
    doc.text('Certificate of Achievement', 148.5, 40, { align: 'center' })
    
    // Student name
    doc.setFontSize(24)
    doc.setTextColor(0, 0, 0)
    doc.text(`This certifies that`, 148.5, 70, { align: 'center' })
    
    doc.setFontSize(28)
    doc.setTextColor(251, 191, 36)
    doc.text(user.privacyAlias || 'Student', 148.5, 90, { align: 'center' })
    
    // Achievement text
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text(`Has successfully completed`, 148.5, 115, { align: 'center' })
    
    doc.setFontSize(24)
    doc.setTextColor(14, 165, 233)
    doc.text(template.name, 148.5, 135, { align: 'center' })
    
    // Date
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text(`Awarded on ${new Date().toLocaleDateString()}`, 148.5, 160, { align: 'center' })
    
    // XP earned
    doc.setFontSize(16)
    doc.setTextColor(251, 191, 36)
    doc.text(`XP Earned: ${gamification.xp}`, 148.5, 175, { align: 'center' })
    
    // Save the PDF
    doc.save(`${template.name.replace(/\s+/g, '_')}_certificate.pdf`)
  }
  
  const renderAvatars = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {AVATAR_REWARDS.map(avatar => {
        const unlocked = isUnlocked('avatar', avatar.id)
        const equipped = isEquipped('avatar', avatar.id)
        
        return (
          <div
            key={avatar.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all cursor-pointer',
              equipped && 'bg-primary-50 border-primary-500 ring-2 ring-primary-300',
              unlocked && !equipped && 'bg-white border-gray-200 hover:border-primary-300',
              !unlocked && 'bg-gray-50 border-gray-200 opacity-60'
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3',
                equipped && 'bg-primary-100',
                unlocked && !equipped && 'bg-gray-100',
                !unlocked && 'bg-gray-200'
              )}>
                {unlocked ? avatar.icon : <Lock className="w-8 h-8 text-gray-400" />}
              </div>
              
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{avatar.name}</h3>
              
              <div className="flex items-center gap-1 mb-3">
                <Sparkles className="w-3 h-3 text-accent-500" />
                <span className="text-xs text-accent-600">{avatar.cost} XP</span>
              </div>
              
              {equipped ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="w-4 h-4" />
                  <span>Equipped</span>
                </div>
              ) : unlocked ? (
                <button
                  onClick={() => handleEquip('avatar', avatar.id)}
                  className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-full transition-colors"
                >
                  Equip
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock('avatar', avatar.id, avatar.cost)}
                  disabled={!canAfford(avatar.cost)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full transition-colors',
                    canAfford(avatar.cost)
                      ? 'bg-accent-100 hover:bg-accent-200 text-accent-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Unlock
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
  
  const renderFrames = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {FRAME_REWARDS.map(frame => {
        const unlocked = isUnlocked('frame', frame.id)
        const equipped = isEquipped('frame', frame.id)
        
        return (
          <div
            key={frame.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all cursor-pointer',
              equipped && 'bg-primary-50 border-primary-500 ring-2 ring-primary-300',
              unlocked && !equipped && 'bg-white border-gray-200 hover:border-primary-300',
              !unlocked && 'bg-gray-50 border-gray-200 opacity-60'
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-16 h-16 rounded-lg mb-3 flex items-center justify-center',
                  equipped && 'ring-4',
                  unlocked && !equipped && 'ring-2',
                  !unlocked && 'ring-1 ring-gray-300'
                )}
                style={{ 
                  borderColor: frame.color,
                  backgroundColor: unlocked ? '#f0f0f0' : '#e0e0e0'
                }}
              >
                {unlocked ? (
                  <User className="w-8 h-8 text-gray-600" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{frame.name}</h3>
              
              <div className="flex items-center gap-1 mb-3">
                <Sparkles className="w-3 h-3 text-accent-500" />
                <span className="text-xs text-accent-600">{frame.cost} XP</span>
              </div>
              
              {equipped ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="w-4 h-4" />
                  <span>Equipped</span>
                </div>
              ) : unlocked ? (
                <button
                  onClick={() => handleEquip('frame', frame.id)}
                  className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-full transition-colors"
                >
                  Equip
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock('frame', frame.id, frame.cost)}
                  disabled={!canAfford(frame.cost)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full transition-colors',
                    canAfford(frame.cost)
                      ? 'bg-accent-100 hover:bg-accent-200 text-accent-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Unlock
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
  
  const renderThemes = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {THEME_REWARDS.map(theme => {
        const unlocked = isUnlocked('theme', theme.id)
        const equipped = isEquipped('theme', theme.id)
        
        return (
          <div
            key={theme.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all cursor-pointer',
              equipped && 'bg-primary-50 border-primary-500 ring-2 ring-primary-300',
              unlocked && !equipped && 'bg-white border-gray-200 hover:border-primary-300',
              !unlocked && 'bg-gray-50 border-gray-200 opacity-60'
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-lg mb-3 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                }}
              >
                {unlocked ? (
                  <Palette className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-8 h-8 text-white/50" />
                )}
              </div>
              
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{theme.name}</h3>
              
              <div className="flex items-center gap-1 mb-3">
                <Sparkles className="w-3 h-3 text-accent-500" />
                <span className="text-xs text-accent-600">{theme.cost} XP</span>
              </div>
              
              {equipped ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="w-4 h-4" />
                  <span>Equipped</span>
                </div>
              ) : unlocked ? (
                <button
                  onClick={() => handleEquip('theme', theme.id)}
                  className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-full transition-colors"
                >
                  Equip
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock('theme', theme.id, theme.cost)}
                  disabled={!canAfford(theme.cost)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full transition-colors',
                    canAfford(theme.cost)
                      ? 'bg-accent-100 hover:bg-accent-200 text-accent-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Unlock
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
  
  const renderCertificates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CERTIFICATE_TEMPLATES.map(certificate => (
        <div
          key={certificate.id}
          className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 hover:border-yellow-300 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">{certificate.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {certificate.autoAward ? 'Automatically awarded when you achieve this milestone.' : 'Available for purchase.'}
              </p>
              
              <button
                onClick={() => generateCertificate(certificate)}
                className="flex items-center gap-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Rewards Shop</h2>
        </div>
        <div className="flex items-center gap-2 bg-accent-50 px-4 py-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-accent-500" />
          <span className="font-bold text-accent-700">{gamification.xp} XP</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('avatars')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
            activeTab === 'avatars' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <User className="w-4 h-4 inline mr-2" />
          Avatars
        </button>
        
        <button
          onClick={() => setActiveTab('frames')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
            activeTab === 'frames' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Frames
        </button>
        
        <button
          onClick={() => setActiveTab('themes')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
            activeTab === 'themes' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Themes
        </button>
        
        <button
          onClick={() => setActiveTab('certificates')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
            activeTab === 'certificates' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Certificates
        </button>
      </div>
      
      {/* Content */}
      <div className="min-h-[300px]">
        {activeTab === 'avatars' && renderAvatars()}
        {activeTab === 'frames' && renderFrames()}
        {activeTab === 'themes' && renderThemes()}
        {activeTab === 'certificates' && renderCertificates()}
      </div>
      
      {/* Low Bandwidth Notice */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Low-Bandwidth Friendly</h4>
            <p className="text-sm text-green-700">
              All rewards are lightweight digital items. Certificates are generated as PDFs that can be printed by your teachers. Perfect for areas with limited internet connectivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
