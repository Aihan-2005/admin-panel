'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  Save,
  ShieldAlert,
} from 'lucide-react'

import { useParams } from 'next/navigation'

import { AccountStatusBadge } from '@/components/common/AccountStatusBadge'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import { LawyerStatusBadge } from '@/components/lawyers/LawyerStatusBadge'

import {
  getLawyer,
  updateLawyerAccountStatus,
  updateLawyerState,
} from '@/services/lawyer.service'

import type { AccountStatus } from '@/types/common'

import {
  LAWYER_STATE_LABELS,
  type Lawyer,
  type LawyerState,
} from '@/types/lawyer'

const LAWYER_STATES =
  Object.keys(
    LAWYER_STATE_LABELS,
  ) as LawyerState[]

export default function LawyerDetailsPage() {
  const params =
    useParams<{
      id: string
    }>()

  const lawyerId = params.id

  const [
    lawyer,
    setLawyer,
  ] =
    useState<Lawyer | null>(
      null,
    )

  const [
    selectedState,
    setSelectedState,
  ] =
    useState<LawyerState>(
      'PENDING_VERIFICATION',
    )

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

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSavingState,
    setIsSavingState,
  ] = useState(false)

  const [
    isSavingAccount,
    setIsSavingAccount,
  ] = useState(false)

  useEffect(() => {
    let active = true

    getLawyer(lawyerId)
      .then((data) => {
        if (!active) {
          return
        }

        setLawyer(data)

        setSelectedState(
          data.state,
        )
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت وکیل',
          )
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [lawyerId])

  async function handleStateUpdate() {
    if (
      !lawyer ||
      selectedState ===
        lawyer.state
    ) {
      return
    }

    try {
      setIsSavingState(true)
      setError(null)
      setSuccess(null)

      const updated =
        await updateLawyerState(
          lawyer.id,
          selectedState,
        )

      setLawyer(updated)

      setSelectedState(
        updated.state,
      )

      setSuccess(
        'وضعیت حرفه‌ای وکیل با موفقیت تغییر کرد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت وکیل ناموفق بود.',
      )
    } finally {
      setIsSavingState(false)
    }
  }

  async function handleAccountStatusUpdate(
    accountStatus: AccountStatus,
  ) {
    if (
      !lawyer ||
      lawyer.accountStatus ===
        accountStatus
    ) {
      return
    }

    const message =
      accountStatus ===
      'SUSPENDED'
        ? 'با مسدود کردن اکانت، کاربر دیگر نمی‌تواند وارد حساب شود. ادامه می‌دهید؟'
        : 'اکانت دوباره فعال شود؟'

    if (
      !window.confirm(message)
    ) {
      return
    }

    try {
      setIsSavingAccount(
        true,
      )

      setError(null)
      setSuccess(null)

      const updated =
        await updateLawyerAccountStatus(
          lawyer.id,
          accountStatus,
        )

      setLawyer(updated)

      setSuccess(
        accountStatus ===
          'SUSPENDED'
          ? 'اکانت وکیل مسدود شد.'
          : 'اکانت وکیل فعال شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت اکانت ناموفق بود.',
      )
    } finally {
      setIsSavingAccount(
        false,
      )
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!lawyer) {
    return (
      <ErrorState
        message={
          error ??
          'وکیل پیدا نشد.'
        }
      />
    )
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-5xl space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/lawyers"
            className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"
          >
            <ArrowRight
              size={16}
            />

            بازگشت به وکلا
          </Link>

          <h1 className="text-2xl font-black text-zinc-900">
            {
              lawyer.fullName
            }
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            مدیریت اطلاعات و
            وضعیت‌های مستقل وکیل
          </p>
        </div>

        <LawyerStatusBadge
          state={lawyer.state}
        />
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">
            اطلاعات وکیل
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <InfoRow
              label="شماره تماس"
              value={
                lawyer.phone
              }
              ltr
            />

            <InfoRow
              label="ایمیل"
              value={
                lawyer.email
              }
              ltr
            />

            <InfoRow
              label="تخصص"
              value={
                lawyer.specialization ||
                '—'
              }
            />

            <InfoRow
              label="شماره پروانه"
              value={
                lawyer.licenseNumber ||
                '—'
              }
            />

            <InfoRow
              label="تاریخ ثبت‌نام"
              value={new Date(
                lawyer.createdAt,
              ).toLocaleDateString(
                'fa-IR',
              )}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">
            وضعیت حرفه‌ای وکیل
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            این وضعیت فقط مجوز
            فعالیت وکیل در سامانه
            را کنترل می‌کند و به
            ورود به اکانت ارتباطی
            ندارد.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              value={
                selectedState
              }
              onChange={(e) =>
                setSelectedState(
                  e.target
                    .value as LawyerState,
                )
              }
              className="h-11 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {LAWYER_STATES.map(
                (state) => (
                  <option
                    key={
                      state
                    }
                    value={
                      state
                    }
                  >
                    {
                      LAWYER_STATE_LABELS[
                        state
                      ]
                    }
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              disabled={
                isSavingState ||
                selectedState ===
                  lawyer.state
              }
              onClick={
                handleStateUpdate
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                size={16}
              />

              ذخیره
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={20}
                className="text-red-600"
              />

              <h2 className="font-black text-zinc-900">
                وضعیت اکانت /
                احراز هویت
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              این وضعیت مستقل از
              وضعیت وکیل است.
              SUSPENDED یعنی کاربر
              حتی اجازه login ندارد؛
              مناسب شرایط امنیتی مثل
              احتمال هک شدن اکانت.
            </p>
          </div>

          <AccountStatusBadge
            status={
              lawyer.accountStatus
            }
          />
        </div>

        <div className="mt-5">
          {lawyer.accountStatus ===
          'ACTIVE' ? (
            <button
              type="button"
              disabled={
                isSavingAccount
              }
              onClick={() =>
                handleAccountStatusUpdate(
                  'SUSPENDED',
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              مسدود کردن اکانت
            </button>
          ) : (
            <button
              type="button"
              disabled={
                isSavingAccount
              }
              onClick={() =>
                handleAccountStatusUpdate(
                  'ACTIVE',
                )
              }
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              فعال کردن اکانت
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function InfoRow({
  label,
  value,
  ltr = false,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-zinc-500">
        {label}
      </dt>

      <dd
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="font-bold text-zinc-800"
      >
        {value}
      </dd>
    </div>
  )
}