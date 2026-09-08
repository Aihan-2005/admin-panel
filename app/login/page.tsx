'use client'

import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  getCurrentAdmin,
  loginAdmin,
} from '@/services/auth.service'

export default function LoginPage() {
  const router =
    useRouter()

  const [
    identifier,
    setIdentifier,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


    
  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        await getCurrentAdmin()

        if (active) {
          router.replace('/')
        }
      } catch {
        if (active) {
          setIsCheckingSession(
            false,
          )
        }
      }
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [router])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedIdentifier =
      identifier.trim()

    if (
      !normalizedIdentifier ||
      !password
    ) {
      setError(
        'لطفاً اطلاعات ورود را کامل وارد کنید.',
      )

      return
    }

    try {
      setIsSubmitting(true)

      setError(null)

      await loginAdmin({
        identifier:
          normalizedIdentifier,

        password,
      })

      router.replace('/')

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ورود ناموفق بود. اطلاعات واردشده را بررسی کنید.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <Loader2
            size={20}
            className="animate-spin text-blue-600"
          />

          در حال بررسی وضعیت ورود...
        </div>
      </div>
    )
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute -bottom-52 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',

            backgroundSize:
              '36px 36px',
          }}
        />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl shadow-black/30 lg:grid-cols-[1fr_1.05fr]">
        {/* Brand section */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-32 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
                <Scale size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  دادیار
                </h1>

                <p className="mt-0.5 text-xs font-bold text-blue-200">
                  پنل مدیریت
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-black leading-[1.6]">
                مدیریت امن و
                یکپارچه سامانه
                دادیار
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-8 text-blue-100/80">
                مدیریت وکلا،
                موکلین، تیکت‌ها،
                پرونده‌ها و سایر
                بخش‌های سامانه از
                یک پنل مدیریتی.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SecurityItem>
              دسترسی فقط برای
              مدیران مجاز سامانه
            </SecurityItem>

            <SecurityItem>
              اطلاعات ورود خود را
              در اختیار دیگران
              قرار ندهید
            </SecurityItem>

            <SecurityItem>
              عملیات حساس در
              سیستم قابل بررسی و
              پیگیری است
            </SecurityItem>
          </div>
        </section>

        {/* Login section */}

        <section className="bg-white px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <Scale size={24} />
                </div>

                <div>
                  <h1 className="text-xl font-black text-slate-950">
                    دادیار
                  </h1>

                  <p className="text-xs font-bold text-slate-400">
                    پنل مدیریت
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <LockKeyhole
                  size={23}
                />
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
                ورود به پنل
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                برای ادامه،
                اطلاعات حساب
                مدیریت خود را وارد
                کنید.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                 شماره موبایل یا ایمیل

                </span>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      identifier
                    }
                    onChange={(
                      event,
                    ) =>
                      setIdentifier(
                        event
                          .target
                          .value,
                      )
                    }
                    autoComplete="username"
                    autoFocus
                    disabled={
                      isSubmitting
                    }
              placeholder="0912... یا admin@example.com"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pr-11 pl-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  رمز عبور
                </span>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event
                          .target
                          .value,
                      )
                    }
                    autoComplete="current-password"
                    disabled={
                      isSubmitting
                    }
                    placeholder="رمز عبور"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pr-11 pl-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? 'مخفی کردن رمز عبور'
                        : 'نمایش رمز عبور'
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !identifier.trim() ||
                  !password
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    در حال ورود...
                  </>
                ) : (
                  <>
                    <LogIn
                      size={18}
                    />

                    ورود به پنل
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-2 text-xs leading-6 text-slate-400">
                <ShieldCheck
                  size={16}
                  className="mt-1 shrink-0 text-emerald-600"
                />

                <span>
                  این بخش فقط
                  برای مدیران مجاز
                  سامانه است. امکان
                  ثبت‌نام عمومی در
                  پنل مدیریت وجود
                  ندارد.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function SecurityItem({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs font-bold text-blue-100/80">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <ShieldCheck
          size={14}
        />
      </span>

      {children}
    </div>
  )
}