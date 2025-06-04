import './globals.css';
import { Inter } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { CanvasProvider } from '../contexts/CanvasContext';
import LayoutWrapper from './components/LayoutWrapper';

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
            <CanvasProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CanvasProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
