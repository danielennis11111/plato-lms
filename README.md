# Plato - Modern Learning Management System

A standalone web application that provides a comprehensive learning management system with AI-powered assistance, calendar integration, and progress tracking. Built with Next.js 14, React 18, and Tailwind CSS.

## Features

### Core Features
- **Modern UI/UX**: Clean, responsive interface with collapsible sidebar navigation
- **AI Learning Assistant**: Context-aware chatbot that adapts to current page content
- **Smart Calendar**: Assignment tracking, progress milestones, and deadline management
- **Progress Tracking**: Visual progress indicators and automated progress calculations
- **Course Management**: Detailed course views with modules, assignments, and learning objectives
- **Assignment Management**: Kanban-style assignment board with drag-and-drop functionality

### Technical Features
- **Next.js 14**: App Router and Server Components
- **React 18**: Latest features and performance improvements
- **Tailwind CSS**: Modern, utility-first styling
- **TypeScript**: Type-safe development
- **Mock API**: Realistic data simulation for development

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plato-lms.git
   cd plato-lms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
plato-lms/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── components/         # Shared components
│   │   │   ├── Sidebar.tsx     # Collapsible navigation
│   │   │   └── Chat.tsx        # Context-aware chatbot
│   │   ├── dashboard/          # Dashboard components
│   │   ├── courses/           # Course-related pages
│   │   ├── assignments/       # Assignment management
│   │   ├── calendar/          # Calendar views
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard (homepage)
│   ├── lib/                    # Utility functions
│   │   └── mockCanvasApi.ts    # Mock API implementation
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

### Mock Data
- Full semester of course data
- Multiple courses with modules
- Assignments with due dates
- Realistic course descriptions and content

### Chat Assistant
- Context-aware responses
- Floating chat button
- Real-time message updates
- Page-specific assistance

## Development

### Key Dependencies
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.511.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
```

### Future Enhancements
- Real AI integration for the chatbot
- Authentication system
- Real-time notifications
- Calendar event creation
- Enhanced course analytics
- Mobile responsiveness improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 