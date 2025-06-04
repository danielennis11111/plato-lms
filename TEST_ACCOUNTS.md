# Test Accounts for Plato LMS 2.0

This document provides login credentials for pre-configured test accounts in the Plato LMS demo system.

## Available Test Accounts

### 1. Alex Chen (Experienced Student)
- **Email:** `student@plato.edu`
- **Password:** `Student123!`
- **Description:** Student with enrolled courses and progress

**Profile:**
- Computer Science undergraduate student (Class of 2025)
- GPA: 3.8
- Learning Style: Visual
- Enrolled in 3 courses with varying progress

**Course Progress:**
- **Advanced Web Development (CS380)** - 90% grade, completed 2/6 modules
- **Machine Learning Fundamentals (CS485)** - 92% grade, completed 1/5 modules  
- **Database Systems Architecture (CS455)** - 78% grade, completed 1/4 modules

**Features to Test:**
- View course progress and grades
- Review completed assignments and quizzes
- Access bookmarked content
- Personal notes and study materials
- Academic performance tracking

---

### 2. Jordan Smith (New Student)
- **Email:** `newstudent@plato.edu`
- **Password:** `NewStudent123!`
- **Description:** New student with blank slate for course creation

**Profile:**
- Computer Science undergraduate student (Class of 2027)
- New to programming
- Learning Style: Hands-on/Kinesthetic
- No course enrollments yet

**Features to Test:**
- Course discovery and enrollment
- Natural language course creation
- Fresh student experience
- First-time user onboarding
- Building learning profile from scratch

---

### 3. Taylor Johnson (English Freshman)
- **Email:** `english.freshman@plato.edu`
- **Password:** `EnglishFresh123!`
- **Description:** English freshman with Literature & Composition courses

**Profile:**
- English major undergraduate student (Class of 2028)
- Passionate about literature and creative writing
- Learning Style: Reading/Writing focused
- Enrolled in 2 English courses with full semester curriculum

**Course Enrollments:**
- **Introduction to Literature (ENG101)** - 6 modules, 12 assignments covering poetry, fiction, drama, and cultural contexts
- **Composition and Rhetoric (ENG102)** - 6 modules, 11 assignments focusing on academic writing, research, and argumentation

**Features to Test:**
- Full English curriculum with realistic assignments
- Literary analysis and writing assignments
- Discussion posts and peer interactions
- Research and citation exercises
- Portfolio and reflection projects
- Humanities-focused AI assistance

---

## How to Use Test Accounts

### Option 1: Quick Login (Recommended)
1. Click the "Sign In" button in the sidebar
2. Click "Show Test Accounts" 
3. Click on either test account to login automatically

### Option 2: Manual Login
1. Click the "Sign In" button in the sidebar
2. Enter the email and password from above
3. Click "Sign In"

### Option 3: Demo Mode
- Continue as a guest user to explore without logging in
- Limited functionality but good for initial exploration

## Test Account Features

### Alex Chen Account Tests:
- ✅ View enrolled courses with real progress data
- ✅ Check assignment submissions and grades
- ✅ Review quiz attempts and scores
- ✅ Access bookmarked course materials
- ✅ View personal notes and study reminders
- ✅ Test Socratic AI with course context
- ✅ Calendar integration with due dates

### Jordan Smith Account Tests:
- ✅ Course discovery from clean slate
- ✅ Natural language course creation
- ✅ Initial course enrollment flow
- ✅ Learning preference setup
- ✅ First assignment completion
- ✅ Building academic profile
- ✅ New user onboarding experience

### Taylor Johnson Account Tests:
- ✅ Full English curriculum with realistic assignments
- ✅ Literary analysis and writing assignments
- ✅ Discussion posts and peer interactions
- ✅ Research and citation exercises
- ✅ Portfolio and reflection projects
- ✅ Humanities-focused AI assistance

## Future Canvas Integration

When Canvas API integration is complete, these test accounts will also support:
- Canvas OAuth authentication
- Real Canvas course data
- Canvas assignment integration  
- Canvas discussion participation
- Canvas grade synchronization
- Personal Gemini API key management

## Development Notes

- Test accounts are automatically created on first app load
- Data is stored in localStorage for demo purposes
- Test accounts reset on browser localStorage clear
- Passwords use proper hashing for security demonstration
- Both accounts support all authentication features 