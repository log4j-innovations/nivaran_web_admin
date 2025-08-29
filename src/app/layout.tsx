import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'
import { ToastProvider } from '@/lib/toastContext'

export const metadata: Metadata = {
  title: 'Municipal Hazard Dashboard',
  description: 'Admin dashboard for managing crowdsourced road hazard reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter antialiased">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
