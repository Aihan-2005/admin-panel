'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import type { AdminUser } from '@/types/auth'

interface AdminHeaderProps {
  admin: AdminUser | null

  onMenuToggle?: () => void

  onLogout: () => void

  isLoggingOut?: boolean
}

export function AdminHeader({
  admin,
  onMenuToggle,
  onLogout,
  isLoggingOut = false,
}: AdminHeaderProps) {
  const [
    isUserMenuOpen,
    setIsUserMenuOpen,
  ] = useState(false)

  const userMenuRef =
    useRef<HTMLDivElement>(
      null,
    )

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsUserMenuOpen(
          false,
        )
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
  }, [])

  const displayName =
    admin?.fullName?.trim() ||
    admin?.username?.trim() ||
    'ادمین'

  const secondaryText =
    admin?.email ||
  admin?.phone ||
    'مدیر سامانه'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={
            onMenuToggle
          }
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu
            className="h-6 w-6"
          />
        </button>

        <div className="hidden items-center gap-2 text-xs font-bold text-slate-400 sm:flex">
          <ShieldCheck
            size={16}
            className="text-emerald-600"
          />

          دسترسی مدیریت
        </div>

        <div className="flex-1 lg:hidden" />

        <div
          className="relative"
          ref={userMenuRef}
        >
          <button
            type="button"
            onClick={() =>
              setIsUserMenuOpen(
                (
                  current,
                ) =>
                  !current,
              )
            }
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <UserRound
                size={18}
              />
            </div>

            <div className="hidden max-w-40 text-right sm:block">
              <div className="truncate text-xs font-black text-slate-900">
                {displayName}
              </div>

              <div
                dir="ltr"
                className="mt-0.5 truncate text-[10px] font-medium text-slate-400"
              >
                {secondaryText}
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                isUserMenuOpen
                  ? 'rotate-180'
                  : ''
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <UserRound
                      size={18}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {displayName}
                    </p>

                    <p
                      dir="ltr"
                      className="mt-0.5 truncate text-left text-xs text-slate-400"
                    >
                      {secondaryText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(
                      false,
                    )

                    onLogout()
                  }}
                  disabled={
                    isLoggingOut
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut
                      size={17}
                    />
                  )}

                  <span>
                    {isLoggingOut
                      ? 'در حال خروج...'
                      : 'خروج از حساب'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}