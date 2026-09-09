'use client'

import Link from 'next/link'

import {
  usePathname,
} from 'next/navigation'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CircleHelp,
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

const navGroups: NavGroup[] =
  [
    {
      title: 'نمای کلی',

      items: [
        {
          href: '/',

          label:
            'داشبورد',

          description:
            'خلاصه وضعیت سامانه',

          icon:
            LayoutDashboard,
        },
      ],
    },

    {
      title:
        'مدیریت کاربران',

      items: [
        {
          href:
            '/lawyers',

          label:
            'وکلا',

          description:
            'احراز، تعلیق و مدیریت وکلا',

          icon: Scale,
        },

        {
          href:
            '/clients',

          label:
            'موکلین',

          description:
            'مدیریت کاربران موکل',

          icon: Users,
        },
      ],
    },

    {
      title: 'پشتیبانی',

      items: [
        {
          href:
            '/tickets',

          label:
            'تیکت‌ها',

          description:
            'پاسخ‌گویی، فایل و وضعیت تیکت',

          icon:
            MessageSquareText,
        },

        {
          href:
            '/faq',

          label:
            'سوالات متداول',

          description:
            'مدیریت FAQ سامانه',

          icon:
            CircleHelp,
        },
      ],
    },
  ]

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname =
    usePathname()

  function isPathActive(
    href: string,
  ) {
    if (href === '/') {
      return (
        pathname === '/'
      )
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    )
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منوی مدیریت"
          onClick={
            onClose
          }
          className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-[290px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:w-72 lg:translate-x-0 lg:shadow-none ${
          isOpen
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <Link
            href="/"
            onClick={
              onClose
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white">
              د
            </div>

            <div>
              <h1 className="font-black">
                دادیار
              </h1>

              <p className="text-xs text-slate-500">
                پنل مدیریت
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 lg:hidden"
          >
            <X
              size={21}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navGroups.map(
              (group) => (
                <section
                  key={
                    group.title
                  }
                >
                  <p className="mb-2 px-3 text-[11px] font-black text-slate-400">
                    {
                      group.title
                    }
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map(
                      (
                        item,
                      ) => {
                        const Icon =
                          item.icon

                        const active =
                          isPathActive(
                            item.href,
                          )

                        return (
                          <Link
                            key={
                              item.href
                            }
                            href={
                              item.href
                            }
                            onClick={
                              onClose
                            }
                            className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                              active
                                ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/80'
                                : 'text-slate-700 hover:bg-blue-50'
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                active
                                  ? 'bg-white/15'
                                  : 'bg-slate-100'
                              }`}
                            >
                              <Icon
                                size={
                                  19
                                }
                              />
                            </span>

                            <span className="min-w-0">
                              <span className="block text-sm font-black">
                                {
                                  item.label
                                }
                              </span>

                              <span
                                className={`mt-0.5 block truncate text-[11px] ${
                                  active
                                    ? 'text-blue-100'
                                    : 'text-slate-400'
                                }`}
                              >
                                {
                                  item.description
                                }
                              </span>
                            </span>
                          </Link>
                        )
                      },
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck
                size={18}
              />

              <span className="text-xs font-black">
                پنل مدیریتی
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-emerald-700">
              عملیات حساس فقط از
              حساب ADMIN قابل انجام
              است.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}