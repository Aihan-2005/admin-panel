'use client'

import { useState } from 'react'

import AdminSidebar from '@/components/layout/AdminSidebar'

import { AdminHeader } from '@/components/layout/AdminHeader'

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false)

  return (
    <div
      className="flex min-h-screen bg-zinc-50"
      dir="rtl"
    >
      <AdminSidebar
        isOpen={
          isSidebarOpen
        }
        onClose={() =>
          setIsSidebarOpen(
            false,
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          onMenuToggle={() =>
            setIsSidebarOpen(
              true,
            )
          }
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}