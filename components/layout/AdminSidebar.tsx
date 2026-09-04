'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard,Users, X } from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

 
const navItems = [
  {
    href: '/',
    label: 'داشبورد',
    icon: LayoutDashboard,
  },
  {
    href: '/lawyers',
    label: 'وکلا',
    icon: Users,
  },
  {
    href: '/clients',
    label: 'موکلین',
    icon: Users,
  },
]
  const isPathActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-72 flex-col border-l border-slate-200 bg-white shadow-xl shadow-slate-200/40 transition-transform duration-300 lg:sticky lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-950">دادیار</h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                پنل ادمین
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isPathActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${
                  active
                    ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active
                      ? 'bg-white/15'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }`}
                >
                  <Icon size={20} />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}