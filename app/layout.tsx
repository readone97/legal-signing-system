import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prenup Sign - Secure Legal Document Signing',
  description: 'Inspired by prenup.fun - ESIGN compliant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}