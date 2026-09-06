import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/lib/context/app-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { BackToTop } from '@/components/ui/BackToTop';
import Footer from '@/components/Footer';

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
            <BackToTop />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


