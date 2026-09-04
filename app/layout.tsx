import type { Metadata } from 'next'
import './globals.css'
import AdminShell from '@/components/layout/AdminShell'

export const metadata: Metadata = {
  title: 'پنل ادمین دادیار',
  description: 'پنل مدیریت سیستم دادیار',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}