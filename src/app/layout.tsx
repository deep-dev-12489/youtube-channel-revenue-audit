import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TubePulse - YouTube Competitor & Channel Analytics',
  description: 'Full-stack YouTube competitor and channel intelligence dashboard powered by Next.js, Recharts, and Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
