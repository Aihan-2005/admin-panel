'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  AlertCircle,
  Loader2,
  RefreshCcw,
} from 'lucide-react'

import AdminSidebar from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'

import {
  getCurrentAdmin,
  logoutAdmin,
} from '@/services/auth.service'

import { ApiError } from '@/lib/api/client'

import type { AdminUser } from '@/types/auth'

type AuthState =
  | 'checking'
  | 'authenticated'
  | 'error'

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false)

  const [
    admin,
    setAdmin,
  ] = useState<AdminUser | null>(
    null,
  )

  const [
    authState,
    setAuthState,
  ] = useState<AuthState>(
    'checking',
  )

  const [
    authError,
    setAuthError,
  ] = useState<string | null>(
    null,
  )

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  /**
   * صفحه Login عمومی است
   * و نباید برای خودش Auth Guard اجرا شود.
   */
  const isLoginPage =
    pathname === '/login'

  /**
   * بررسی وضعیت ورود کاربر
   */
  const checkAuthentication =
    useCallback(async () => {
      /**
       * روی صفحه Login
       * بررسی Auth از داخل AdminShell
       * انجام نمی‌شود.
       *
       * خود LoginPage می‌تواند
       * Session را بررسی کند.
       */
      if (isLoginPage) {
        return
      }

      try {
        setAuthState(
          'checking',
        )

        setAuthError(null)

        const currentAdmin =
          await getCurrentAdmin()

        setAdmin(
          currentAdmin,
        )

        setAuthState(
          'authenticated',
        )
      } catch (err) {
        setAdmin(null)

        /**
         * هم ApiError واقعی Backend
         * و هم Error مربوط به Mock Auth
         * را پشتیبانی می‌کنیم.
         */
        const status =
          err instanceof ApiError
            ? err.status
            : typeof err ===
                  'object' &&
                err !== null &&
                'status' in err
              ? Number(
                  (
                    err as {
                      status?: unknown
                    }
                  ).status,
                )
              : undefined

        /**
         * اگر Session وجود نداشت
         * یا دسترسی Admin نداشت،
         * مستقیم به Login منتقل شود.
         */
        if (
          status === 401 ||
          status === 403
        ) {
          router.replace(
            '/login',
          )

          return
        }

        /**
         * خطاهای دیگر مثل:
         *
         * Network Error
         * Server Error
         * Config Error
         *
         * به صورت صفحه خطا نمایش داده می‌شوند.
         */
        setAuthError(
          err instanceof Error
            ? err.message
            : 'امکان بررسی وضعیت ورود وجود ندارد.',
        )

        setAuthState(
          'error',
        )
      }
    }, [
      isLoginPage,
      router,
    ])

  /**
   * هر بار Route تغییر کند،
   * وضعیت Auth بررسی می‌شود.
   */
  useEffect(() => {
    void checkAuthentication()
  }, [
    checkAuthentication,
  ])

  /**
   * Logout
   */
  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    try {
      setIsLoggingOut(
        true,
      )

      await logoutAdmin()
    } catch {
      /**
       * حتی اگر API Logout
       * در Backend خطا داد،
       * Front کاربر را از پنل خارج می‌کند.
       *
       * در حالت Mock نیز Session
       * داخل localStorage حذف می‌شود.
       */
    } finally {
      setAdmin(null)

      setIsLoggingOut(
        false,
      )

      router.replace(
        '/login',
      )

      router.refresh()
    }
  }

  /**
   * =========================
   * LOGIN PAGE
   * =========================
   *
   * Login نباید Sidebar
   * یا Header پنل را داشته باشد.
   */
  if (isLoginPage) {
    return (
      <>
        {children}
      </>
    )
  }

  /**
   * =========================
   * CHECKING AUTH
   * =========================
   *
   * تا زمانی که Session بررسی نشده،
   * محتوای پنل نمایش داده نمی‌شود.
   */
  if (
    authState ===
    'checking'
  ) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50"
      >
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2
              size={27}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-black text-slate-700">
            در حال بررسی دسترسی...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            وضعیت ورود شما بررسی
            می‌شود
          </p>
        </div>
      </div>
    )
  }

  /**
   * =========================
   * AUTH ERROR
   * =========================
   */
  if (
    authState ===
    'error'
  ) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 p-4"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle
              size={25}
            />
          </div>

          <h1 className="mt-4 text-lg font-black text-slate-950">
            خطا در بررسی دسترسی
          </h1>

          <p className="mt-2 text-sm leading-7 text-slate-500">
            {authError}
          </p>

          <button
            type="button"
            onClick={() =>
              void checkAuthentication()
            }
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <RefreshCcw
              size={16}
            />

            تلاش دوباره
          </button>
        </div>
      </div>
    )
  }

  /**
   * =========================
   * AUTHENTICATED ADMIN PANEL
   * =========================
   */
  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-zinc-50"
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
          admin={admin}
          isLoggingOut={
            isLoggingOut
          }
          onLogout={() =>
            void handleLogout()
          }
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