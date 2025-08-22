import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Golden Arrow',
  description: 'Your financial dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-sp-bg text-sp-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
