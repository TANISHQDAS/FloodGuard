import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FloodGuard – Smart River Water Level Monitoring & Early Warning System',
  description: 'Production-ready IoT flood early-warning platform by Tanishq Das (23BAI10587) and Abhi Pandey (23BAI10909), VIT Bhopal University.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f17] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
