// Core data models for StudyBuddy

export const SCHOOL_CURRICULA = {
  UNHCR: 'UNHCR Guidelines',
  IGCSE: 'IGCSE',
  LOCAL: 'Local Standards',
  CUSTOM: 'Custom'
}

export const SUBJECT_CATEGORIES = {
  MATH: 'Math',
  SCIENCE: 'Science',
  ENGLISH: 'English',
  SOCIAL_STUDIES: 'Social Studies',
  ART: 'Art',
  PHYSICAL_EDUCATION: 'Physical Education',
  LANGUAGE: 'Language',
  OTHER: 'Other'
}

export const BADGE_TYPES = {
  VOCABULARY_KNIGHT: {
    id: 'vocab_knight',
    name: 'Vocabulary Knight',
    description: 'Complete 50 vocabulary exercises',
    icon: '🗡️',
    requirement: 50,
    category: 'academic'
  },
  MATH_WIZARD: {
    id: 'math_wizard',
    name: 'Math Wizard',
    description: 'Complete 100 math problems',
    icon: '🧙',
    requirement: 100,
    category: 'academic'
  },
  STREAK_SURVIVOR: {
    id: 'streak_survivor',
    name: 'Streak Survivor',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    requirement: 7,
    category: 'engagement'
  },
  PEER_MENTOR: {
    id: 'peer_mentor',
    name: 'Peer Mentor',
    description: 'Help 5 classmates with their studies',
    icon: '🤝',
    requirement: 5,
    category: 'social'
  },
  CHAPTER_MASTER: {
    id: 'chapter_master',
    name: 'Chapter Master',
    description: 'Complete 10 chapters',
    icon: '📚',
    requirement: 10,
    category: 'academic'
  },
  WEEKLY_WARRIOR: {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete all weekly goals for 4 weeks',
    icon: '⚔️',
    requirement: 4,
    category: 'engagement'
  }
}

export const REWARD_TYPES = {
  AVATAR: 'avatar',
  FRAME: 'frame',
  THEME: 'theme',
  CERTIFICATE: 'certificate'
}

export const AVATAR_REWARDS = [
  { id: 'avatar_1', name: 'Explorer', cost: 500, icon: '🧭', type: REWARD_TYPES.AVATAR },
  { id: 'avatar_2', name: 'Scholar', cost: 750, icon: '🎓', type: REWARD_TYPES.AVATAR },
  { id: 'avatar_3', name: 'Hero', cost: 1000, icon: '🦸', type: REWARD_TYPES.AVATAR },
  { id: 'avatar_4', name: 'Scientist', cost: 800, icon: '🔬', type: REWARD_TYPES.AVATAR },
  { id: 'avatar_5', name: 'Artist', cost: 600, icon: '🎨', type: REWARD_TYPES.AVATAR }
]

export const FRAME_REWARDS = [
  { id: 'frame_1', name: 'Bronze Frame', cost: 300, color: '#cd7f32', type: REWARD_TYPES.FRAME },
  { id: 'frame_2', name: 'Silver Frame', cost: 500, color: '#c0c0c0', type: REWARD_TYPES.FRAME },
  { id: 'frame_3', name: 'Gold Frame', cost: 800, color: '#ffd700', type: REWARD_TYPES.FRAME },
  { id: 'frame_4', name: 'Rainbow Frame', cost: 1200, color: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', type: REWARD_TYPES.FRAME }
]

export const THEME_REWARDS = [
  { id: 'theme_1', name: 'Ocean Blue', cost: 400, colors: { primary: '#0ea5e9', secondary: '#0284c7' }, type: REWARD_TYPES.THEME },
  { id: 'theme_2', name: 'Forest Green', cost: 400, colors: { primary: '#22c55e', secondary: '#16a34a' }, type: REWARD_TYPES.THEME },
  { id: 'theme_3', name: 'Sunset Orange', cost: 400, colors: { primary: '#f97316', secondary: '#ea580c' }, type: REWARD_TYPES.THEME },
  { id: 'theme_4', name: 'Royal Purple', cost: 600, colors: { primary: '#a855f7', secondary: '#9333ea' }, type: REWARD_TYPES.THEME }
]

export const CERTIFICATE_TEMPLATES = [
  { id: 'cert_1', name: 'Chapter Completion', cost: 0, autoAward: true },
  { id: 'cert_2', name: 'Weekly Goal Master', cost: 0, autoAward: true },
  { id: 'cert_3', name: 'Subject Champion', cost: 0, autoAward: true },
  { id: 'cert_4', name: 'Academic Excellence', cost: 0, autoAward: true }
]

// Default sample data
export const DEFAULT_SUBJECTS = {
  [SCHOOL_CURRICULA.UNHCR]: [
    { id: 'unhcr_math', name: 'Mathematics', category: SUBJECT_CATEGORIES.MATH, chapters: ['Numbers', 'Operations', 'Geometry', 'Measurement'] },
    { id: 'unhcr_science', name: 'Science', category: SUBJECT_CATEGORIES.SCIENCE, chapters: ['Living Things', 'Matter', 'Energy', 'Earth'] },
    { id: 'unhcr_english', name: 'English', category: SUBJECT_CATEGORIES.ENGLISH, chapters: ['Reading', 'Writing', 'Speaking', 'Listening'] },
    { id: 'unhcr_social', name: 'Social Studies', category: SUBJECT_CATEGORIES.SOCIAL_STUDIES, chapters: ['Community', 'Culture', 'Geography', 'History'] }
  ],
  [SCHOOL_CURRICULA.IGCSE]: [
    { id: 'igcse_math', name: 'Mathematics', category: SUBJECT_CATEGORIES.MATH, chapters: ['Number', 'Algebra', 'Geometry', 'Statistics'] },
    { id: 'igcse_physics', name: 'Physics', category: SUBJECT_CATEGORIES.SCIENCE, chapters: ['Motion', 'Forces', 'Energy', 'Waves'] },
    { id: 'igcse_chemistry', name: 'Chemistry', category: SUBJECT_CATEGORIES.SCIENCE, chapters: ['Particles', 'Bonding', 'Reactions', 'Organic'] },
    { id: 'igcse_biology', name: 'Biology', category: SUBJECT_CATEGORIES.SCIENCE, chapters: ['Cells', 'Organisms', 'Ecosystems', 'Genetics'] },
    { id: 'igcse_english', name: 'English Language', category: SUBJECT_CATEGORIES.ENGLISH, chapters: ['Reading', 'Writing', 'Speaking', 'Listening'] }
  ],
  [SCHOOL_CURRICULA.LOCAL]: [
    { id: 'local_math', name: 'Mathematics', category: SUBJECT_CATEGORIES.MATH, chapters: ['Arithmetic', 'Algebra', 'Geometry', 'Statistics'] },
    { id: 'local_science', name: 'Science', category: SUBJECT_CATEGORIES.SCIENCE, chapters: ['Biology', 'Chemistry', 'Physics'] },
    { id: 'local_lang', name: 'Native Language', category: SUBJECT_CATEGORIES.LANGUAGE, chapters: ['Reading', 'Writing', 'Grammar', 'Literature'] },
    { id: 'local_english', name: 'English', category: SUBJECT_CATEGORIES.ENGLISH, chapters: ['Reading', 'Writing', 'Speaking'] }
  ]
}
