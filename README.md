# Plato's Canvas 2.0 🎓

An AI-powered Learning Management System featuring Socratic dialogue-based tutoring, comprehensive course management, and intelligent discussion facilitation.

## ✨ Features

### 🤖 Socratic AI Tutor
- **Intelligent Questioning**: AI pretends to know nothing to discover student misconceptions
- **Context-Aware Teaching**: Adapts responses based on assignments, quizzes, discussions, and courses
- **Academic Integrity**: Guides learning without providing direct answers
- **Custom Avatar**: Personalized Socrates avatar for engaging interactions

### 👥 User Management System
- **Multi-User Support**: Individual accounts with secure authentication
- **Personal API Keys**: Users can store their own Gemini API keys securely
- **User Profiles**: Customizable learning preferences and academic information
- **Session Management**: Secure login/logout with session persistence
- **Guest Mode**: Full demo experience without registration

### 📚 Learning Environment
- **Course Management**: Comprehensive course content and progress tracking
- **Assignment Guidance**: Step-by-step help without revealing answers
- **Quiz Intelligence**: Different behaviors for active vs completed quizzes
- **Discussion Simulation**: AI-powered classroom discussion continuation
- **Calendar Integration**: Smart scheduling and deadline management

### 🔒 Security & Privacy
- **Encrypted Storage**: Secure handling of user data and API keys
- **Data Isolation**: Personal chat histories and settings per user
- **Privacy Controls**: Configurable privacy and sharing preferences

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/danielennis11111/plato-lms.git
cd plato-lms

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
Open your browser to [http://localhost:3000](http://localhost:3000)

## 🎯 Getting Started

### 1. **Demo Mode (No Registration)**
- Start using immediately as a guest user
- All features available with global API key
- Perfect for exploring the system

### 2. **Create Account (Recommended)**
- Click "Sign Up" in the sidebar
- Set up your profile and preferences
- Add your personal Gemini API key in Settings
- Enjoy personalized learning experience

### 3. **Add Your API Key**
- Go to Settings page
- Enter your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Test the connection
- Start having intelligent conversations with Socrates!

## 💡 Usage Tips

### **Socratic Dialogues**
- Ask questions about course material
- Seek guidance on assignments (without getting direct answers)
- Reflect on completed quizzes
- Explore conceptual connections

### **Course Navigation**
- Browse mock courses and assignments
- Use calendar for deadline tracking
- Participate in AI-simulated discussions
- Access context-aware help on any page

### **Learning Optimization**
- Set learning goals in your profile
- Configure notification preferences
- Use bookmarks for important content
- Track progress across subjects

## 🛠 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **State Management**: React Context
- **Storage**: LocalStorage (with plans for database integration)
- **Authentication**: Custom secure session management

### Key Directories

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Layout)
├── lib/               # Utility functions and services
├── types/             # TypeScript type definitions
└── styles/            # Global styles and Tailwind config
```

## 🔧 Configuration

### Environment Variables
Currently using localStorage for demo purposes. Future versions will support:
- Database connections
- External API configurations
- Deployment-specific settings

### Customization
- Modify Socratic prompts in `src/app/components/Chat.tsx`
- Adjust user interface in `src/app/components/`
- Configure authentication in `src/contexts/AuthContext.tsx`

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

This is currently a demonstration project showcasing AI-powered educational technology. 

### Roadmap
- Database integration for persistent storage
- Enhanced discussion simulation
- Advanced user analytics
- Mobile application
- Integration with external LMS platforms

## 📄 License

This project is for educational and demonstration purposes.

## 🆘 Support

For questions about setup or usage:
1. Check the in-app help and tooltips
2. Review this README
3. Examine the code documentation
4. Test with the demo content provided

## 🎉 Acknowledgments

- **Google Generative AI** for powering the Socratic dialogue system
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first styling approach
- **Lucide React** for the beautiful icon library

---

**Happy Learning! 🎓✨**
