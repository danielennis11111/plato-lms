# Multi-Chatbot Integration Guide

## 📋 Step-by-Step Integration

### Step 1: Install Dependencies
```bash
npm install lucide-react
# or
yarn add lucide-react
```

### Step 2: Copy Files to Your Project

1. **Copy `LayoutContext.tsx`** to `src/contexts/LayoutContext.tsx`
2. **Copy `EmbeddedChatButton.tsx`** to `src/components/EmbeddedChatButton.tsx`

### Step 3: Wrap Your App with Layout Provider

Update your main app component or layout:

```tsx
// app/layout.tsx or your main App component
import { LayoutProvider } from './contexts/LayoutContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <LayoutProvider>
          {children}
          {/* Add the chatbot component here for global access */}
        </LayoutProvider>
      </body>
    </html>
  );
}
```

### Step 4: Add the Chatbot Component

Add the chatbot to your layout or individual pages:

```tsx
import EmbeddedChatButton from '../components/EmbeddedChatButton';

export default function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <EmbeddedChatButton />
    </div>
  );
}
```

### Step 5: Configure Chatbot Profiles

Edit the `chatbotProfiles` array in `EmbeddedChatButton.tsx`:

```tsx
const chatbotProfiles: ChatbotProfile[] = [
  {
    id: 'main-assistant',
    name: 'Main AI Assistant',
    url: 'https://your-actual-chatbot-url.com',
    description: 'General purpose assistant'
  },
  {
    id: 'subject-tutor',
    name: 'Subject Tutor',
    url: 'https://your-tutor-chatbot-url.com',
    description: 'Specialized subject tutoring'
  },
  // Add more as needed
];
```

### Step 6: Add Content Width Integration

For pages that need to respond to the chat sidebar, add this pattern:

```tsx
import { useLayout } from '../contexts/LayoutContext';

export default function YourResponsivePage() {
  const { isChatOpen } = useLayout();

  return (
    <main 
      className="transition-all duration-300 ease-in-out"
      style={{
        marginRight: isChatOpen ? '520px' : '0px'
      }}
    >
      {/* Your content */}
    </main>
  );
}
```

## 🔧 Configuration Options

### Customizing Colors
To change from ASU colors to your brand:

1. Find `#8C1D40` (maroon) - replace with your primary color
2. Find `#FFC425` (gold) - replace with your secondary color

### Customizing Sidebar Width
In `EmbeddedChatButton.tsx`, change:
```tsx
const CHAT_WIDTH = 500; // Change this value
```

Don't forget to update the margin calculation in your responsive pages:
```tsx
marginRight: isChatOpen ? `${CHAT_WIDTH + 20}px` : '0px'
```

### Customizing Button Position
In `EmbeddedChatButton.tsx`, find:
```tsx
className={`fixed bottom-6 right-6`} // Change position here
```

## 🧪 Testing

### Basic Functionality Test
1. ✅ Chat button appears in bottom right
2. ✅ Clicking opens/closes sidebar
3. ✅ Dropdown shows all configured profiles
4. ✅ Switching profiles loads new chatbot
5. ✅ Refresh button works
6. ✅ Open in new tab works
7. ✅ Mobile responsive (backdrop overlay)

### Integration Test
1. ✅ Page content shifts when chat opens (if responsive integration added)
2. ✅ Multiple chatbots load correctly
3. ✅ No console errors
4. ✅ Smooth transitions

## 🐛 Common Issues & Solutions

### Issue: "useLayout must be used within a LayoutProvider"
**Solution**: Ensure your app is wrapped with `<LayoutProvider>`

### Issue: Chat button not visible
**Solution**: Check z-index conflicts. The button uses `z-30`

### Issue: Chatbot iframe not loading
**Solution**: 
- Check the URL is correct
- Verify CORS settings on the chatbot server
- Check browser console for iframe errors

### Issue: Dropdown not working
**Solution**: 
- Ensure Tailwind CSS is properly configured
- Check for JavaScript errors in console

### Issue: Styling looks broken
**Solution**: 
- Verify Tailwind CSS is installed and configured
- Check that all required classes are available

## 📱 Mobile Considerations

The component includes:
- Responsive design that works on mobile
- Backdrop overlay on mobile to close chat
- Touch-friendly button sizes

## 🔒 Security Notes

The iframe uses these sandbox permissions:
```
allow-same-origin allow-scripts allow-forms allow-popups 
allow-popups-to-escape-sandbox allow-presentation
```

Review these based on your security requirements.

## 🚀 Going Live

### Pre-deployment Checklist
- [ ] All chatbot URLs are production URLs
- [ ] Profile names and descriptions are finalized
- [ ] Colors match your brand
- [ ] Responsive integration is working on all pages
- [ ] Mobile testing completed
- [ ] Security review completed

### Performance Notes
- Only one iframe loads at a time (performance optimized)
- Smooth transitions with proper loading states
- Minimal bundle size impact

---

**Questions?** Check browser console for errors and verify all steps above. 