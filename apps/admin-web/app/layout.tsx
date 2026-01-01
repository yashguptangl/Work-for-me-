import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Roomlocate - Admin Panel',
  description: 'Secure Admin Panel for Roomlocate Real Estate Platform',
  robots: 'noindex, nofollow', // Prevent search engine indexing
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <AdminAuthProvider>
            {children}
          </AdminAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}