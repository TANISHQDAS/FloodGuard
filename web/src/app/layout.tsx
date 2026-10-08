import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FloodGuard Pro – Smart River Water Level Monitoring & Early Warning System',
  description: 'Production-ready IoT flood early-warning and disaster management platform with multi-station telemetry, predictive modeling, and community evacuation mapping.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
