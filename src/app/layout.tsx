import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import ChatButton from './components/ChatButton';
import MainLayout from './components/MainLayout';
import { LayoutProvider } from './contexts/LayoutContext';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Plato - Modern Learning Management System',
  description: 'AI-powered learning management system with calendar integration and progress tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <LayoutProvider>
              <div className="flex min-h-screen bg-gray-50 relative">
                <Sidebar />
                <MainLayout>
                  {children}
                </MainLayout>
                <ChatButton />
              </div>
            </LayoutProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
