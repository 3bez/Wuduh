import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wuduh — وضوح',
  description: 'Build your feasibility study, one card at a time.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://wuduh.site'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`
        ${ibmPlexSans.variable}
        ${ibmPlexSerif.variable}
        ${ibmPlexMono.variable}
        ${ibmPlexSansArabic.variable}
      `}
    >
      <body className="bg-slate-50 text-slate-700 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
