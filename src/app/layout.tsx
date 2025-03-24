import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Musik Quiz',
  description: 'En rolig musikquiz app för fester och middagar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-50">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}