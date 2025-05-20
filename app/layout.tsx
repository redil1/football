import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Assuming globals.css includes Tailwind directives
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Football Events Blog', // Default title, can be overridden by pages
  description: 'The latest news and insights on football events.', // Default description
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
