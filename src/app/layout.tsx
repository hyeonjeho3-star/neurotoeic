import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/Navigation';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NeuroTOEIC - Brain-Science Based TOEIC Learning',
  description: 'Master TOEIC vocabulary with spaced repetition and active recall',
  manifest: '/manifest.json',
  themeColor: '#FF8B2D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-16 md:pb-0 md:pl-64">
              {children}
            </main>
            <Navigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
