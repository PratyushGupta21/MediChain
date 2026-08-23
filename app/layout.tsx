import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/lib/context/app-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'MediChain — FEFO Pharmaceutical Tracking & Bio-Medical Waste Lifecycle',
  description:
    'A decentralized First-Expired, First-Out protocol for safe medicine redistribution and hazardous disposal.',
  openGraph: {
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-background text-foreground antialiased">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
