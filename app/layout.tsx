import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const ibmSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

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
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmSans.variable} ${ibmMono.variable}`}>
      <body className="bg-background text-slate-100 font-sans antialiased selection:bg-saffron selection:text-white">
        {children}
      </body>
    </html>
  );
}
