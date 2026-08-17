import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'iez! Partner Hub',
  description: 'Portal de documentos e materiais de apoio aos parceiros da iez! telecom.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gray-50 text-gray-800 antialiased h-screen overflow-hidden">
        <Suspense fallback={<div className="h-screen bg-gray-50" />}>
          <AuthGuard>{children}</AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}