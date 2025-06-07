# 📦 Multi-Chatbot Sidebar Integration Package

## What This Package Provides

A complete **multi-chatbot sidebar system** with profile switching capabilities that can be easily integrated into any Canvas LMS or React/Next.js application.

## 🎯 Key Features

✅ **Multiple Chatbot Profiles** - Switch between different AI assistants with a dropdown  
✅ **Performance Optimized** - Only loads the selected chatbot (no multiple iframes)  
✅ **Responsive Design** - Content automatically adjusts width when chat opens  
✅ **Canvas Integration Ready** - Designed specifically for LMS environments  
✅ **Mobile Friendly** - Works perfectly on all devices  
✅ **Easy Configuration** - Simple array-based chatbot configuration  
✅ **Custom Branding** - Easily customize colors and styling  

## 📁 Files to Share with Your Team Member

### Core Files (Required)
1. **`PACKAGE_COMPONENTS/EmbeddedChatButton.tsx`** - Main chatbot sidebar component
2. **`PACKAGE_COMPONENTS/LayoutContext.tsx`** - Required context for state management

### Documentation (Helpful)
3. **`PACKAGE_INTEGRATION_GUIDE.md`** - Step-by-step integration instructions
4. **`CHATBOT_INTEGRATION_PACKAGE.md`** - Complete feature overview
5. **`PACKAGE_EXAMPLES/canvas-integration-example.tsx`** - Example Canvas page integration

## 🚀 Quick Start for Your Team Member

### 1. Copy Files
- Copy `LayoutContext.tsx` → `src/contexts/LayoutContext.tsx`
- Copy `EmbeddedChatButton.tsx` → `src/components/EmbeddedChatButton.tsx`

### 2. Install Dependency
```bash
npm install lucide-react
```

### 3. Wrap App with Provider
```tsx
import { LayoutProvider } from './contexts/LayoutContext';

// In your main layout or app component
<LayoutProvider>
  {/* Your app */}
  <EmbeddedChatButton />
</LayoutProvider>
```

### 4. Configure Chatbots
Edit the `chatbotProfiles` array in `EmbeddedChatButton.tsx` with your actual chatbot URLs and names.

### 5. Add Responsive Integration (Optional)
For pages that should respond to the chat width:
```tsx
const { isChatOpen } = useLayout();
<main style={{ marginRight: isChatOpen ? '520px' : '0px' }}>
```

## 🧪 Testing Checklist

- [ ] Chat button appears and opens/closes sidebar
- [ ] Profile dropdown shows all configured chatbots
- [ ] Switching profiles loads different chatbots
- [ ] Page content shifts when chat opens (if responsive integration added)
- [ ] Works on mobile devices
- [ ] No console errors

## 📞 What Your Team Member Needs

### Required Info:
1. **Actual chatbot URLs** (replace the demo URLs)
2. **Chatbot names** and descriptions
3. **Brand colors** (if different from ASU maroon/gold)

### Technical Requirements:
- React 18+ / Next.js 13+
- Tailwind CSS configured
- lucide-react icons

## 🔧 Integration Points

### Canvas LMS Integration
The system is designed to work with existing Canvas layouts. The key integration point is adding the responsive margin to main content areas.

### Multiple Environment Support
- Development URLs can be different from production
- Easy to configure different chatbots per environment
- No hardcoded values (all configurable)

## 🚨 Important Notes

1. **One iframe at a time** - Performance optimized to only load the selected chatbot
2. **Context required** - Must wrap app with LayoutProvider
3. **CORS considerations** - Chatbot URLs must allow iframe embedding
4. **Responsive integration is optional** - Chat works without it, but content won't shift

## 📋 Production Checklist

- [ ] All chatbot URLs are production URLs
- [ ] Profile names finalized
- [ ] Brand colors updated
- [ ] Responsive integration tested on all pages
- [ ] Mobile testing completed
- [ ] Security review of iframe sandbox permissions

---

**This package provides everything needed for a production-ready multi-chatbot integration.** The team member should start with the integration guide and refer to the example files for implementation patterns. 