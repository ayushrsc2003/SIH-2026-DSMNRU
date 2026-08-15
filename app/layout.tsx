import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIH 2026 Internal Round | IET, DSMNRU Lucknow',
  description: 'Official Registration Portal for Smart India Hackathon 2026 Internal Round at Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University (DSMNRU), Lucknow.',
  keywords: [
    'Smart India Hackathon 2026',
    'SIH 2026',
    'DSMNRU',
    'IET Lucknow',
    'Dr. Shakuntala Misra National Rehabilitation University',
    'College Hackathon',
    'MoE Innovation Cell',
    'AICTE',
  ],
  authors: [{ name: 'IET DSMNRU Hackathon Committee' }],
  openGraph: {
    title: 'Smart India Hackathon 2026 — Internal Round | IET DSMNRU',
    description: 'Register your team of 6 for the internal hackathon screening at IET DSMNRU Lucknow to earn direct nomination for SIH 2026 Grand Finale.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100 font-sans antialiased selection:bg-saffron selection:text-white">
        {children}
      </body>
    </html>
  );
}
