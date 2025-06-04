# Plato - Modern Learning Management System

A standalone web application that provides a comprehensive learning management system with AI-powered assistance, calendar integration, and progress tracking. Built with Next.js 14, React 18, and Tailwind CSS.

## Features

### Core Features
- **Modern UI/UX**: Clean, responsive interface with collapsible sidebar navigation
- **AI Learning Assistant**: Context-aware chatbot that adapts to current page content using Gemini 2.0 Flash
- **Smart Calendar**: Assignment tracking, progress milestones, and deadline management
- **Progress Tracking**: Visual progress indicators and automated progress calculations
- **Course Management**: Detailed course views with modules, assignments, and learning objectives
- **Assignment Management**: Kanban-style assignment board with drag-and-drop functionality
- **Educational AI**: Socratic method approach for academic integrity and guided learning

### Technical Features
- **Next.js 14**: App Router and Server Components
- **React 18**: Latest features and performance improvements
- **Tailwind CSS**: Modern, utility-first styling
- **TypeScript**: Type-safe development
- **Gemini 2.0 Flash**: Advanced AI integration for educational assistance
- **Mock API**: Realistic data simulation for development

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/danielennis11111/plato-lms.git
   cd plato-lms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Gemini API key:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Go to `/settings` in the app and enter your API key

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
plato-lms/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── components/         # Shared components
│   │   │   ├── Sidebar.tsx     # Collapsible navigation
│   │   │   ├── Chat.tsx        # Context-aware AI chatbot
│   │   │   └── ChatButton.tsx  # Floating chat interface
│   │   ├── dashboard/          # Dashboard components
│   │   ├── courses/           # Course-related pages
│   │   ├── assignments/       # Assignment management
│   │   ├── calendar/          # Calendar views
│   │   ├── settings/          # API key and configuration
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard (homepage)
│   ├── lib/                    # Utility functions
│   │   └── mockCanvasApi.ts    # Mock API implementation
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── next.config.js              # Next.js configuration
```

## Current Implementation

### Navigation
- Collapsible left sidebar with icons
- Main sections: Dashboard, Courses, Calendar, Assignments, Chat
- Simple "Plato" text logo

### Dashboard (Homepage)
- Week view calendar
- Course grid
- Upcoming assignments
- Global search/chat input

### AI Chat Assistant
- **Gemini 2.0 Flash Integration**: Intelligent, context-aware responses
- **Socratic Method**: Guides learning through questions rather than giving direct answers
- **Academic Integrity**: Prevents cheating while encouraging understanding
- **Assignment Context**: Recognizes current assignment and provides relevant help
- **Fresh Conversations**: Each page starts a new dialogue to prevent context bleeding

### Mock Data
- Full semester of course data (Summer 2025)
- Multiple courses with modules and quizzes
- Assignments with due dates and detailed requirements
- Realistic course descriptions and learning objectives

## Development

### Key Dependencies
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.511.0",
    "react-markdown": "^9.0.1",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
```

### Recent Updates
- ✅ Integrated Gemini 2.0 Flash for intelligent AI responses
- ✅ Implemented educational Socratic method approach
- ✅ Fixed chat history bleeding between pages
- ✅ Added comprehensive assignment context detection
- ✅ Enhanced UI with improved typography and layout
- ✅ Added quiz system with full page support

### Future Enhancements
- Rename "Chat" to "Dialogues" with "Socrates" as the AI assistant
- Enhanced visual design and animations
- Real-time collaborative features
- Enhanced course analytics
- Mobile app development
- Integration with real LMS systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
