'use client'

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Eye,
  EyeOff,
  Loader2,
  Plus,
  UserPlus,
  X,
} from 'lucide-react'

import {
  createLawyer,
} from '@/services/lawyer.service'

import type {
  Lawyer,
} from '@/types/lawyer'

interface CreateLawyerModalProps {
  open: boolean

  onClose: () => void

  onCreated: (
    lawyer: Lawyer,
  ) => void
}

const INITIAL_FORM = {
  firstName: '',

  lastName: '',

  phone: '',

  email: '',

  password: '',

  confirmPassword: '',

  specialization: '',

  licenseNumber: '',
}

export function CreateLawyerModal({
  open,
  onClose,
  onCreated,
}: CreateLawyerModalProps) {
  const [
    form,
    setForm,
  ] = useState(
    INITIAL_FORM,
  )

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow =
      document.body.style
        .overflow

    document.body.style.overflow =
      'hidden'

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          'Escape' &&
        !submitting
      ) {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    open,
    onClose,
    submitting,
  ])

  const validationError =
    useMemo(() => {
      const firstName =
        form.firstName.trim()

      const lastName =
        form.lastName.trim()

      const phone =
        form.phone.trim()

      const email =
        form.email.trim()

      if (!firstName) {
        return 'نام وکیل را وارد کنید.'
      }

      if (!lastName) {
        return 'نام خانوادگی وکیل را وارد کنید.'
      }

      const identifierCount =
        Number(
          Boolean(phone),
        ) +
        Number(
          Boolean(email),
        )

      if (
        identifierCount !==
        1
      ) {
        return 'دقیقاً یکی از شماره موبایل یا ایمیل را وارد کنید.'
      }

      if (
        phone &&
        !/^09\d{9}$/.test(
          phone,
        )
      ) {
        return 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد.'
      }

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email,
        )
      ) {
        return 'ایمیل معتبر نیست.'
      }

      if (
        form.password.length <
        8
      ) {
        return 'رمز عبور باید حداقل ۸ کاراکتر باشد.'
      }

      const passwordBytes =
        new TextEncoder().encode(
          form.password,
        ).length

      if (
        passwordBytes >
        72
      ) {
        return 'رمز عبور بیش از حد طولانی است.'
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        return 'تکرار رمز عبور با رمز عبور یکسان نیست.'
      }

      if (
        form.specialization
          .trim().length >
        150
      ) {
        return 'تخصص نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.'
      }

      if (
        form.licenseNumber
          .trim().length >
        50
      ) {
        return 'شماره پروانه نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.'
      }

      return null
    }, [form])

  function updateField(
    field:
      keyof typeof INITIAL_FORM,
    value: string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    )

    setError(null)
  }

  function resetForm() {
    setForm(
      INITIAL_FORM,
    )

    setError(null)

    setShowPassword(
      false,
    )
  }

  function handleClose() {
    if (submitting) {
      return
    }

    resetForm()

    onClose()
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      validationError
    ) {
      setError(
        validationError,
      )

      return
    }

    try {
      setSubmitting(
        true,
      )

      setError(null)

      const lawyer =
        await createLawyer({
          firstName:
            form.firstName,

          lastName:
            form.lastName,

          phone:
            form.phone.trim() ||
            undefined,

          email:
            form.email.trim() ||
            undefined,

          password:
            form.password,

          specialization:
            form.specialization
              .trim() ||
            undefined,

          licenseNumber:
            form.licenseNumber
              .trim() ||
            undefined,
        })

      resetForm()

      onCreated(
        lawyer,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ساخت حساب وکیل ناموفق بود.',
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="بستن فرم"
        onClick={
          handleClose
        }
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserPlus
                size={20}
              />
            </div>

            <div>
              <h2 className="font-black text-zinc-950">
                افزودن وکیل
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                ساخت حساب و پروفایل
                اولیه وکیل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              submitting
            }
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="نام"
              required
            >
              <input
                value={
                  form.firstName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'firstName',
                    event.target
                      .value,
                  )
                }
                maxLength={100}
                autoFocus
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field
              label="نام خانوادگی"
              required
            >
              <input
                value={
                  form.lastName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'lastName',
                    event.target
                      .value,
                  )
                }
                maxLength={100}
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <div>
            <div className="mb-3">
              <h3 className="text-sm font-black text-zinc-800">
                شناسه ورود
              </h3>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                فقط یکی از شماره
                موبایل یا ایمیل را
                وارد کنید.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="شماره موبایل">
                <input
                  dir="ltr"
                  inputMode="numeric"
                  value={
                    form.phone
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'phone',
                      event.target
                        .value,
                    )
                  }
                  maxLength={11}
                  placeholder="09123456789"
                  className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-left text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              <Field label="ایمیل">
                <input
                  dir="ltr"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'email',
                      event.target
                        .value,
                    )
                  }
                  placeholder="lawyer@example.com"
                  className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-left text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="رمز عبور"
              required
            >
              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    form.password
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'password',
                      event.target
                        .value,
                    )
                  }
                  autoComplete="new-password"
                  placeholder="حداقل ۸ کاراکتر"
                  className="h-11 w-full rounded-xl border border-zinc-300 px-3 pl-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100"
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
            </Field>

            <Field
              label="تکرار رمز عبور"
              required
            >
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  form.confirmPassword
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'confirmPassword',
                    event.target
                      .value,
                  )
                }
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="تخصص">
              <input
                value={
                  form.specialization
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'specialization',
                    event.target
                      .value,
                  )
                }
                maxLength={150}
                placeholder="مثلاً حقوق خانواده"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="شماره پروانه">
              <input
                dir="ltr"
                value={
                  form.licenseNumber
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'licenseNumber',
                    event.target
                      .value,
                  )
                }
                maxLength={50}
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-left text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-6 text-blue-800">
            حساب ساخته‌شده به‌صورت
            اولیه در وضعیت «در انتظار
            احراز» قرار می‌گیرد. بعد
            از بررسی اطلاعات می‌توانید
            آن را از صفحه جزئیات وکیل
            فعال کنید.
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={
                submitting
              }
              className="h-11 rounded-xl border border-zinc-300 px-5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus
                  size={17}
                />
              )}

              {submitting
                ? 'در حال ساخت حساب...'
                : 'افزودن وکیل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string

  required?: boolean

  children:
    React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-zinc-600">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  )
}
