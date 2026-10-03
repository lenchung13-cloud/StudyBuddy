# StudyBuddy 🎓

An educational app with gamification features designed for refugee students, providing personalized learning paths, progress tracking, and engaging rewards.

## Features

### Module 1: Student Self-Management & Dynamic Academic Calendar
- **Custom Academic Year Tracker**: Set your school year (e.g., March to December) with a visual progress timeline showing current week vs total weeks
- **Curriculum & Subject Mapper**: Support for multiple curricula (UNHCR guidelines, IGCSE, local standards) with custom subject building
- **Personalized Daily Roadmap**: Auto-generated weekly learning goals based on your academic calendar and subjects

### Module 2: Gamification & Reward Architecture
- **Adventure Map & Quest System**: Progress through chapters like a quest grid with level-based unlocking
- **XP, Badges & Streaks**: 
  - Earn XP by completing chapters, practice sets, and weekly evaluations
  - Milestone badges (Vocabulary Knight, Math Wizard, Streak Survivor, Peer Mentor)
  - Daily streak tracking to encourage consistent learning
- **School Leaderboards**: Inter-school and intra-school leaderboards with privacy aliases to protect refugee identities
- **Low-Bandwidth Rewards**: 
  - Digital cosmetic items (custom avatars, profile frames, background themes)
  - Printable PDF certificates for teachers to award

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **jsPDF** - PDF certificate generation
- **date-fns** - Date manipulation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

### Getting Started

1. **Set Up Your Academic Year**: Navigate to "Academic Year" and set your start and end dates
2. **Choose Your Curriculum**: Select from UNHCR, IGCSE, Local Standards, or build a custom curriculum
3. **Add Subjects**: Either use pre-loaded subjects or create custom ones with specific chapters
4. **View Your Roadmap**: The app automatically generates weekly goals based on your timeline
5. **Start Learning**: Complete chapters to earn XP and unlock rewards

### Features Overview

- **Dashboard**: Overview of your progress, XP level, streak, and quick actions
- **Academic Year**: Visual timeline showing your progress through the school year
- **Curriculum**: Manage your subjects and track chapter completion
- **Roadmap**: Weekly and daily learning goals auto-generated for you
- **Adventure Map**: Quest-style progression through your learning material
- **XP & Badges**: Track your gamification progress and earned badges
- **Leaderboard**: Compete with other students (privacy-protected)
- **Rewards Shop**: Spend XP on avatars, frames, themes, and download certificates

## Privacy & Accessibility

- **Privacy Aliases**: Students are identified by generated aliases (e.g., "BraveLion42") on leaderboards
- **Low-Bandwidth Design**: Lightweight digital rewards and printable certificates
- **Offline-First**: Progress is saved locally in your browser

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
studybuddy/
├── src/
│   ├── components/          # React components
│   │   ├── AcademicYearTracker.jsx
│   │   ├── AdventureMap.jsx
│   │   ├── CurriculumMapper.jsx
│   │   ├── GamificationDashboard.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── RoadmapGenerator.jsx
│   │   └── RewardsShop.jsx
│   ├── context/            # React Context for state management
│   │   └── AppContext.jsx
│   ├── data/               # Data models and constants
│   │   └── models.js
│   ├── utils/              # Utility functions
│   │   └── cn.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## License

This project is designed for educational purposes, particularly for refugee education initiatives.

## Contributing

This project is open to contributions that improve accessibility, add new curriculum standards, or enhance the gamification features while maintaining the low-bandwidth focus.
