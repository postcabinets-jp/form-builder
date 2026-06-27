import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'form-builder — Open-source Typeform alternative',
    template: '%s | form-builder',
  },
  description:
    'Build conversational forms with unlimited responses. Free & open-source alternative to Typeform.',
  keywords: ['form builder', 'typeform alternative', 'survey', 'open source'],
  openGraph: {
    title: 'form-builder',
    description: 'Build conversational forms with unlimited responses.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
