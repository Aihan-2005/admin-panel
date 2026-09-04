'use client'

import {
  type FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Eye,
  EyeOff,
  KeyRound,
  Save,
  ShieldAlert,
} from 'lucide-react'

import { updateLawyerPassword } from '@/services/lawyer.service'

interface LawyerPasswordSectionProps {
  lawyerId: string
  lawyerName: string
}

export function LawyerPasswordSection({
  lawyerId,
  lawyerName,
}: LawyerPasswordSectionProps) {
  const [
    password,
    setPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    forceChangeOnNextLogin,
    setForceChangeOnNextLogin,
  ] = useState(true)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    )

  const validationMessage =
    useMemo(() => {
      if (
        !password &&
        !confirmPassword
      ) {
        return null
      }

      if (
        password.length <
        8
      ) {
        return 'رمز عبور باید حداقل ۸ کاراکتر باشد.'
      }

      if (
        password !==
        confirmPassword
      ) {
        return 'تکرار رمز عبور با رمز جدید یکسان نیست.'
      }

      return null
    }, [
      confirmPassword,
      password,
    ])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !password ||
      validationMessage
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `رمز عبور ${lawyerName} تغییر کند؟ بهتر است کاربر در ورود بعدی مجبور به انتخاب رمز جدید شود.`,
      )

    if (!confirmed) {
      return
    }

    try {
      setIsSaving(true)

      setError(null)
      setSuccess(null)

      await updateLawyerPassword(
        lawyerId,
        {
          password,

          forceChangeOnNextLogin,
        },
      )

      setPassword('')

      setConfirmPassword(
        '',
      )

      setForceChangeOnNextLogin(
        true,
      )

      setSuccess(
        'رمز عبور با موفقیت تغییر کرد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر رمز عبور ناموفق بود.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-100">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <KeyRound
            size={20}
          />
        </div>

        <div>
          <h2 className="font-black text-zinc-950">
            تغییر رمز عبور وکیل
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            این اکشن مربوط به
            حساب کاربری است و هیچ
            تغییری در وضعیت
            حرفه‌ای وکیل ایجاد
            نمی‌کند.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
        <ShieldAlert
          size={17}
          className="mt-0.5 shrink-0"
        />

        <span>
          برای امنیت بیشتر، گزینه
          اجبار به تغییر رمز در
          ورود بعدی را فعال نگه
          دارید و در بک‌اند نیز
          sessionهای قبلی کاربر را
          invalidate کنید.
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordField
            label="رمز عبور جدید"
            value={password}
            onChange={
              setPassword
            }
            showPassword={
              showPassword
            }
            onToggleVisibility={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
          />

          <PasswordField
            label="تکرار رمز عبور"
            value={
              confirmPassword
            }
            onChange={
              setConfirmPassword
            }
            showPassword={
              showPassword
            }
            onToggleVisibility={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
          />
        </div>

        {validationMessage && (
          <p className="text-xs font-bold text-red-600">
            {
              validationMessage
            }
          </p>
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <input
            type="checkbox"
            checked={
              forceChangeOnNextLogin
            }
            onChange={(
              event,
            ) =>
              setForceChangeOnNextLogin(
                event.target
                  .checked,
              )
            }
            className="mt-1 h-4 w-4 accent-blue-600"
          />

          <span>
            <span className="block text-sm font-black text-zinc-800">
              تغییر اجباری رمز در
              ورود بعدی
            </span>

            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              بعد از ورود موفق،
              وکیل باید رمز موقت
              تعیین‌شده توسط ادمین
              را تغییر دهد.
            </span>
          </span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isSaving ||
              !password ||
              Boolean(
                validationMessage,
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={16}
            />

            {isSaving
              ? 'در حال ذخیره...'
              : 'تغییر رمز عبور'}
          </button>
        </div>
      </form>
    </section>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  showPassword: boolean
  onToggleVisibility: () => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-zinc-600">
        {label}
      </span>

      <div className="relative">
        <input
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .value,
            )
          }
          autoComplete="new-password"
          placeholder="حداقل ۸ کاراکتر"
          className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 pl-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={
            onToggleVisibility
          }
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label={
            showPassword
              ? 'مخفی کردن رمز'
              : 'نمایش رمز'
          }
        >
          {showPassword ? (
            <EyeOff
              size={17}
            />
          ) : (
            <Eye
              size={17}
            />
          )}
        </button>
      </div>
    </label>
  )
}