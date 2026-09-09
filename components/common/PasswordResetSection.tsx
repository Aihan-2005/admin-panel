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

interface PasswordResetSectionProps {
  title: string

  subjectName: string

  onReset: (
    password: string,
  ) => Promise<void>
}

export function PasswordResetSection({
  title,
  subjectName,
  onReset,
}: PasswordResetSectionProps) {
  const [
    password,
    setPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    saving,
    setSaving,
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

  const validation =
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

      const bytes =
        new TextEncoder().encode(
          password,
        ).length

      if (bytes > 72) {
        return 'رمز عبور بیش از حد طولانی است.'
      }

      if (
        password !==
        confirmPassword
      ) {
        return 'تکرار رمز عبور یکسان نیست.'
      }

      return null
    }, [
      confirmPassword,
      password,
    ])

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (
      !password ||
      validation
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `رمز عبور ${subjectName} تغییر کند؟ نشست‌های فعال این کاربر از بین خواهند رفت.`,
      )

    if (!confirmed) {
      return
    }

    try {
      setSaving(true)

      setError(null)
      setSuccess(null)

      await onReset(
        password,
      )

      setPassword('')

      setConfirmPassword(
        '',
      )

      setSuccess(
        'رمز عبور با موفقیت تغییر کرد و نشست‌های قبلی کاربر باطل شدند.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر رمز عبور ناموفق بود.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <KeyRound
            size={20}
          />
        </div>

        <div>
          <h2 className="font-black">
            {title}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            مدیر می‌تواند برای
            حساب کاربر رمز جدید
            تعیین کند.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
        <ShieldAlert
          size={17}
          className="mt-1 shrink-0"
        />

        <span>
          پس از تغییر رمز،
          تمام Refresh Sessionهای
          فعال کاربر revoke
          می‌شوند.
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
          submit
        }
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordInput
            label="رمز عبور جدید"
            value={password}
            setValue={
              setPassword
            }
            show={
              showPassword
            }
            toggle={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
          />

          <PasswordInput
            label="تکرار رمز عبور"
            value={
              confirmPassword
            }
            setValue={
              setConfirmPassword
            }
            show={
              showPassword
            }
            toggle={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
          />
        </div>

        {validation && (
          <p className="text-xs font-bold text-red-600">
            {validation}
          </p>
        )}

        <button
          type="submit"
          disabled={
            saving ||
            !password ||
            Boolean(
              validation,
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-black text-white disabled:opacity-50"
        >
          <Save
            size={16}
          />

          {saving
            ? 'در حال تغییر...'
            : 'تغییر رمز عبور'}
        </button>
      </form>
    </section>
  )
}

function PasswordInput({
  label,
  value,
  setValue,
  show,
  toggle,
}: {
  label: string

  value: string

  setValue: (
    value: string,
  ) => void

  show: boolean

  toggle: () => void
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black text-zinc-600">
        {label}
      </span>

      <div className="relative">
        <input
          type={
            show
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(
            event,
          ) =>
            setValue(
              event.target
                .value,
            )
          }
          autoComplete="new-password"
          className="h-11 w-full rounded-xl border border-zinc-300 px-3 pl-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={
            toggle
          }
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"
        >
          {show ? (
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