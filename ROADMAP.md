# Roadmap - Canvas API Integration & Enhanced AI Dialogues

## Branch: feature/user-management-and-discussions

### 🏗️ **Revised Architecture: Canvas + Gemini Integration**

Instead of building custom user management, we're leveraging existing Canvas LMS infrastructure:

- **Canvas API**: User authentication, course data, assignments, discussions
- **Personal Gemini Keys**: Each user provides their own API key for AI features
- **Focus**: Socratic AI enhancement as value-add to existing LMS
- **Demo Mode**: Full functionality without Canvas connection for showcasing

### 🚀 Development Setup

**Prerequisites:**
- Node.js 18+ and npm installed
- Git for version control

**Quick Start:**
```bash
# Clone the repository
git clone https://github.com/danielennis11111/plato-lms.git
cd plato-lms

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### 🎯 **New Primary Objectives**

#### 1. Canvas LTI/API Integration
- **Canvas OAuth**: Authenticate users through Canvas instead of custom registration
- **Real Course Data**: Pull actual courses, assignments, discussions from Canvas API
- **Permissions**: Leverage Canvas enrollment and access controls
- **LTI Tool**: Option to deploy as Canvas external tool
- **Demo Mode**: Fallback for showcasing without Canvas connection

#### 2. Personal Gemini API Key Management
- **User-Provided Keys**: Each Canvas user adds their own Gemini API key
- **Secure Storage**: Encrypted storage per Canvas user ID
- **Demo Compatibility**: Backward compatibility with global keys
- **Usage Tracking**: Monitor API usage per user
- **Key Validation**: Test API keys before saving

#### 3. Enhanced Socratic AI with Real Data
- **Real Context**: Use actual Canvas assignments, discussions, course content
- **Canvas-Aware Responses**: AI understands Canvas-specific features and workflows
- **Academic Calendar**: Integration with real due dates and course schedules
- **Discussion Continuation**: Enhance real Canvas discussions with AI insights
- **Assignment Guidance**: Context-aware help based on actual assignment requirements

### 🛠 **Technical Implementation Plan**

#### Phase 1: Canvas API Foundation ✅
1. **Canvas API Service**
   - [x] Complete Canvas API wrapper with all major endpoints
   - [x] OAuth authentication flow
   - [x] LTI integration helpers
   - [x] Error handling and rate limiting

2. **Canvas Context Provider**
   - [x] Canvas user and course state management
   - [x] Demo mode fallback
   - [x] Gemini API key management per Canvas user
   - [ ] Integration with existing components

3. **Authentication Flow**
   - [ ] Canvas OAuth login flow
   - [ ] Token management and refresh
   - [ ] Demo mode toggle
   - [ ] User profile from Canvas data

#### Phase 2: AI Integration with Real Data
1. **Enhanced Chat Context**
   - [ ] Replace mock API calls with real Canvas data
   - [ ] Context detection from Canvas URLs and pages
   - [ ] Real assignment and discussion analysis
   - [ ] Canvas-specific AI prompts and responses

2. **Socratic AI Improvements**
   - [ ] Understanding of Canvas assignment types and requirements
   - [ ] Integration with Canvas discussion threads
   - [ ] Real course syllabus and objectives awareness
   - [ ] Canvas grading and feedback integration

3. **Personal API Key System**
   - [ ] Per-user Gemini key management UI
   - [ ] Canvas user ID based storage
   - [ ] API key testing and validation
   - [ ] Usage analytics and monitoring

#### Phase 3: LTI Tool Development
1. **LTI Integration**
   - [ ] LTI 1.3 specification compliance
   - [ ] Canvas app configuration
   - [ ] Deep linking support
   - [ ] Grade passback integration

2. **Canvas Tool Interface**
   - [ ] Embedded tool views within Canvas
   - [ ] Canvas navigation and theming
   - [ ] Mobile-responsive LTI interface
   - [ ] Canvas notification integration

3. **Deployment Options**
   - [ ] Canvas app store submission
   - [ ] Institution-specific deployment
   - [ ] Multi-tenant architecture
   - [ ] Configuration management

### 📊 **Success Metrics**

#### Canvas Integration
- Seamless Canvas OAuth authentication
- Real course and assignment data successfully loaded
- Canvas users can set and use personal Gemini API keys
- Demo mode provides full functionality for showcasing

#### AI Enhancement Value
- Socratic AI provides meaningful insights on real Canvas content
- Students receive personalized help based on actual assignments
- AI responses feel contextually appropriate to Canvas environment
- Academic integrity maintained with real course material

#### Technical Performance
- Fast Canvas API integration and data loading
- Secure handling of user API keys and Canvas tokens
- Efficient caching and rate limiting for Canvas API calls
- Responsive UI that integrates well with Canvas ecosystem

### 🎨 **UI/UX Changes**

#### Canvas Integration Interface
- Canvas OAuth login button
- "Connect to Canvas" setup flow
- Canvas course and user profile display
- Demo mode toggle and explanation

#### API Key Management
- Personal Gemini API key setup within Canvas context
- Key testing and validation interface
- Usage monitoring and limits
- Security and privacy explanations

#### Canvas-Aware Features
- Canvas assignment and discussion context detection
- Canvas-themed UI elements and navigation
- Integration with Canvas notifications and alerts
- Canvas mobile app compatibility

### 🔒 **Security & Privacy**

#### Canvas Integration Security
- Secure OAuth token storage and refresh
- Canvas API rate limiting and error handling
- User permission verification through Canvas
- Audit logging for Canvas API access

#### Gemini API Key Protection
- Encrypted storage of user API keys
- Canvas user ID based isolation
- No server-side storage of API keys
- Clear data retention and deletion policies

### 📅 **Updated Timeline**

#### Week 1: Canvas Integration Foundation
- Complete Canvas API service implementation
- Build Canvas OAuth authentication flow
- Create Canvas context provider
- Implement demo mode fallback

#### Week 2: AI + Canvas Data Integration
- Replace mock API with real Canvas data
- Update Chat component for Canvas context
- Implement personal Gemini API key management
- Test AI responses with real Canvas content

#### Week 3: LTI Tool Development
- Build LTI 1.3 integration
- Create Canvas-embedded interface
- Implement Canvas app configuration
- Test deployment within Canvas

#### Week 4: Polish & Deployment
- Canvas app store preparation
- Documentation and setup guides
- Security audit and testing
- Performance optimization

---

## **Benefits of Canvas Integration Approach**

### ✅ **Advantages**
- **Leverage Existing Infrastructure**: No need to rebuild user management, course systems
- **Real Data**: Work with actual Canvas courses, assignments, users
- **Instant User Base**: Canvas institutions have thousands of existing users
- **Security**: Leverage Canvas's robust authentication and permission systems
- **Familiar UX**: Users work within familiar Canvas environment
- **Scalability**: Canvas handles user management, we focus on AI value-add

### 🎯 **Value Proposition**
- **For Students**: Intelligent Socratic tutoring within their existing LMS
- **For Instructors**: Enhanced discussion facilitation and student guidance
- **For Institutions**: AI-powered learning enhancement with minimal IT overhead
- **For Developers**: Focus on AI innovation rather than LMS infrastructure

### 🚀 **Market Opportunity**
- **Canvas Market**: 30+ million users across thousands of institutions
- **LTI Ecosystem**: Established marketplace for educational tools
- **AI Education**: Growing demand for AI-powered learning assistance
- **Differentiation**: Socratic method approach unique in LMS space 