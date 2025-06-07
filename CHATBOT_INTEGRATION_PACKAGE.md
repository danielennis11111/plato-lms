# Multi-Chatbot Sidebar Integration Package

This package provides a complete multi-chatbot sidebar system with profile switching capabilities for Canvas LMS or any React/Next.js application.

## 📦 Package Contents

```
/chatbot-integration/
├── components/
│   ├── EmbeddedChatButton.tsx      # Main chatbot sidebar component
│   └── LayoutContext.tsx           # Required layout context
├── documentation/
│   ├── INTEGRATION_GUIDE.md        # Step-by-step integration
│   ├── CONFIGURATION.md            # Configuration options
│   └── TROUBLESHOOTING.md          # Common issues & solutions
├── examples/
│   ├── canvas-demo-page.tsx        # Example Canvas page with integration
│   └── layout-wrapper.tsx          # Example layout wrapper
└── README.md                       # This file
```

## 🚀 Quick Start

### 1. Copy Required Files
Copy these files to your project:
- `components/EmbeddedChatButton.tsx` → `src/components/`
- `components/LayoutContext.tsx` → `src/contexts/`

### 2. Install Dependencies
```bash
npm install lucide-react
# or
yarn add lucide-react
```

### 3. Add Layout Context
Wrap your app with the LayoutProvider:

```tsx
import { LayoutProvider } from './contexts/LayoutContext';

export default function App() {
  return (
    <LayoutProvider>
      {/* Your app content */}
      <EmbeddedChatButton />
    </LayoutProvider>
  );
}
```

### 4. Configure Chatbot Profiles
Edit the `chatbotProfiles` array in `EmbeddedChatButton.tsx`:

```tsx
const chatbotProfiles: ChatbotProfile[] = [
  {
    id: 'your-chatbot',
    name: 'Your Chatbot Name',
    url: 'https://your-chatbot-url.com',
    description: 'Description of your chatbot'
  },
  // Add more chatbots as needed
];
```

## ✨ Features

- **Multi-Profile Support**: Switch between multiple chatbots with a dropdown
- **Performance Optimized**: Only loads the selected chatbot iframe
- **Responsive Design**: Works on desktop and mobile
- **Canvas Integration**: Automatically adjusts main content width when open
- **Custom Branding**: ASU colors and styling (easily customizable)
- **Loading States**: Smooth transitions and loading indicators
- **Click Outside**: Dropdown closes when clicking outside

## 🔧 Configuration Options

### Chatbot Profile Structure
```tsx
interface ChatbotProfile {
  id: string;           // Unique identifier
  name: string;         // Display name in dropdown
  url: string;          // Chatbot iframe URL
  description?: string; // Optional description
}
```

### Styling Customization
The component uses Tailwind CSS classes. Key customization points:
- **Colors**: Search for `#8C1D40` (maroon) and `#FFC425` (gold) to change brand colors
- **Width**: Modify `CHAT_WIDTH = 500` to change sidebar width
- **Position**: Adjust `fixed bottom-6 right-6` classes for button position

### Content Width Integration
For proper content margin when chat is open, add this to your main content:

```tsx
const { isChatOpen } = useLayout();

<main 
  className="transition-all duration-300 ease-in-out"
  style={{
    marginRight: isChatOpen ? '520px' : '0px'
  }}
>
  {/* Your content */}
</main>
```

## 🛠 Integration Examples

### Canvas LMS Integration
See `examples/canvas-demo-page.tsx` for a complete Canvas-style page integration.

### Custom Layout Integration
See `examples/layout-wrapper.tsx` for integrating with your existing layout system.

## 📋 Requirements

- React 18+
- Next.js 13+ (or compatible React framework)
- Tailwind CSS
- lucide-react icons

## 🔒 Security Considerations

The iframe uses these sandbox permissions:
```
allow-same-origin allow-scripts allow-forms allow-popups 
allow-popups-to-escape-sandbox allow-presentation
```

Adjust based on your security requirements.

## 🐛 Troubleshooting

### Common Issues

1. **Chatbot not loading**: Check iframe URL and CORS settings
2. **Dropdown not working**: Ensure LayoutContext is properly wrapped
3. **Styling issues**: Verify Tailwind CSS is configured
4. **Content overlap**: Check margin calculations in your layout

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Responsive design included

## 📞 Support

For integration help:
1. Check `documentation/TROUBLESHOOTING.md`
2. Review example files in `examples/`
3. Verify all dependencies are installed
4. Check browser console for errors

## 🔄 Updates

To add new chatbots:
1. Add new profile object to `chatbotProfiles` array
2. Test the new chatbot URL loads correctly
3. Update profile descriptions as needed

---

**Package Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Next.js 13+, React 18+ 