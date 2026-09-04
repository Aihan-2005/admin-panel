import type { Metadata } from 'next'

import './globals.css'

import AdminShell from '@/components/layout/AdminShell'

export const metadata: Metadata = {
  title: {
    default:
      'پنل مدیریت دادیار',

    template:
      '%s | دادیار',
  },

  description:
    'پنل مدیریت سامانه دادیار',

  robots: {
    index: false,
    follow: false,

    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
    >
      <body className="antialiased">
        <AdminShell>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}