import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Lexend } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'An intelligent gallery app powered by Gemini.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable} dark`} suppressHydrationWarning>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
