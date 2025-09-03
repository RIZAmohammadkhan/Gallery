import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Lexend } from 'next/font/google';
import { AuthProvider } from '@/components/auth-provider';
import { SettingsProvider } from '@/lib/settings-context';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  fallback: ['system-ui', 'arial']
});
const lexend = Lexend({ 
  subsets: ['latin'], 
  variable: '--font-lexend',
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'AI Gallery - Smart Photo Organization',
  description: 'An intelligent gallery app powered by AI for smart photo organization and management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable} dark`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <AuthProvider>
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
