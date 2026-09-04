'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  LayoutDashboard,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'نمای کلی',
    items: [
      {
        href: '/',
        label: 'داشبورد',
        description: 'خلاصه وضعیت سامانه',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'مدیریت کاربران',
    items: [
      {
        href: '/lawyers',
        label: 'وکلا',
        description: 'احراز، تعلیق و مدیریت وکلا',
        icon: Scale,
      },
      {
        href: '/clients',
        label: 'موکلین',
        description: 'مدیریت کاربران موکل',
        icon: Users,
      },
    ],
  },
  {
    title: 'عملیات',
    items: [
      {
        href: '/tickets',
        label: 'تیکت‌ها',
        description: 'پشتیبانی و پاسخ‌گویی',
        icon: MessageSquareText,
      },
      {
        href: '/cases',
        label: 'پرونده‌ها',
        description: 'مشاهده پرونده‌های سامانه',
        icon: BriefcaseBusiness,
      },
      {
        href: '/sold-accounts',
        label: 'اکانت‌های فروخته‌شده',
        description: 'فروش‌ها و اشتراک‌های فعال',
        icon: BadgeDollarSign,
      },
    ],
  },
]

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()

  function isPathActive(href: string) {
    if (href === '/') {
      return pathname === '/'
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    )
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منوی مدیریت"
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-[290px] flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 lg:sticky lg:w-72 lg:translate-x-0 lg:shadow-none ${
          isOpen
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-lg shadow-blue-200">
              د
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-slate-950">
                دادیار
              </h1>

              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                پنل مدیریت سامانه
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="بستن منو"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <section key={group.title}>
                <p className="mb-2 px-3 text-[11px] font-black tracking-wide text-slate-400">
                  {group.title}
                </p>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active =
                      isPathActive(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={
                          active
                            ? 'page'
                            : undefined
                        }
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                          active
                            ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/80'
                            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            active
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                          }`}
                        >
                          <Icon size={19} />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">
                            {item.label}
                          </span>

                          <span
                            className={`mt-0.5 block truncate text-[11px] font-medium ${
                              active
                                ? 'text-blue-100'
                                : 'text-slate-400'
                            }`}
                          >
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck size={18} />

              <span className="text-xs font-black">
                پنل مدیریتی
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-emerald-700/80">
              عملیات حساس مثل مسدودسازی
              اکانت و تغییر وضعیت وکیل از
              بخش جزئیات انجام می‌شود.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}