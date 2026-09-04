'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-zinc-50" dir="rtl">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-lg border border-zinc-200 bg-white p-2 shadow-md lg:hidden"
        aria-label="باز کردن منو"
      >
        <Menu size={24} className="text-zinc-700" />
      </button>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  )
}