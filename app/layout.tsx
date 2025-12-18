import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Service Finder',
  description: 'Discover and connect with local service providers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
