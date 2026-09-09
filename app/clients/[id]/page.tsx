'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

import {
  useParams,
} from 'next/navigation'

import {
  AccountStatusBadge,
} from '@/components/common/AccountStatusBadge'

import {
  PasswordResetSection,
} from '@/components/common/PasswordResetSection'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  getClient,
  updateClientAccountStatus,
  updateClientPassword,
} from '@/services/client.service'

import type {
  Client,
} from '@/types/client'

import type {
  AccountStatus,
} from '@/types/common'

function formatDate(
  value: string,
) {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }

  return date.toLocaleDateString(
    'fa-IR',
  )
}

export default function ClientDetailsPage() {
  const {
    id,
  } = useParams<{
    id: string
  }>()

  const [
    client,
    setClient,
  ] =
    useState<Client | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

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

  useEffect(() => {
    let active = true

    getClient(id)
      .then((data) => {
        if (!active) {
          return
        }

        setClient(data)
      })
      .catch((err) => {
        if (!active) {
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : 'خطا در دریافت موکل',
        )
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  async function changeStatus(
    status: AccountStatus,
  ) {
    if (
      !client ||
      client.accountStatus ===
        status
    ) {
      return
    }

    if (
      status ===
        'SUSPENDED' &&
      !window.confirm(
        'این کار ورود موکل به حساب را مسدود می‌کند. ادامه می‌دهید؟',
      )
    ) {
      return
    }

    if (
      status ===
        'ACTIVE' &&
      !window.confirm(
        'اکانت موکل دوباره فعال شود؟',
      )
    ) {
      return
    }

    try {
      setIsSaving(true)

      setError(null)
      setSuccess(null)

      const updated =
        await updateClientAccountStatus(
          client.id,
          status,
        )

      setClient(updated)

      setSuccess(
        status ===
          'ACTIVE'
          ? 'اکانت موکل فعال شد.'
          : 'اکانت موکل مسدود شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت اکانت ناموفق بود.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState label="در حال دریافت اطلاعات موکل..." />
    )
  }

  if (!client) {
    return (
      <ErrorState
        message={
          error ??
          'موکل پیدا نشد.'
        }
      />
    )
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <Link
          href="/clients"
          className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"
        >
          <ArrowRight
            size={16}
          />

          بازگشت به موکلین
        </Link>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-zinc-950">
              {
                client.fullName
              }
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              جزئیات موکل، مدیریت
              دسترسی و تغییر رمز
              عبور حساب
            </p>
          </div>

          <AccountStatusBadge
            status={
              client.accountStatus
            }
          />
        </div>
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="font-black text-zinc-950">
          اطلاعات موکل
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Info
            label="شماره تماس"
            value={
              client.phone ||
              '—'
            }
            ltr
          />

          <Info
            label="ایمیل"
            value={
              client.email ||
              '—'
            }
            ltr
          />

          <Info
            label="تاریخ ثبت‌نام"
            value={formatDate(
              client.createdAt,
            )}
          />

          <Info
            label="وضعیت اکانت"
            value={
              client.accountStatus ===
              'ACTIVE'
                ? 'فعال'
                : 'مسدود'
            }
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={20}
                className="text-red-600"
              />

              <h2 className="font-black text-zinc-950">
                کنترل دسترسی اکانت
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              مسدود کردن اکانت،
              امکان ورود موکل به
              حساب را قطع می‌کند.
              اطلاعات حساب حذف
              نمی‌شوند و مدیر
              می‌تواند دوباره آن را
              فعال کند.
            </p>
          </div>

          <AccountStatusBadge
            status={
              client.accountStatus
            }
          />
        </div>

        <div className="mt-5">
          {client.accountStatus ===
          'ACTIVE' ? (
            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={() =>
                void changeStatus(
                  'SUSPENDED',
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? 'در حال ذخیره...'
                : 'مسدود کردن اکانت'}
            </button>
          ) : (
            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={() =>
                void changeStatus(
                  'ACTIVE',
                )
              }
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? 'در حال ذخیره...'
                : 'فعال کردن اکانت'}
            </button>
          )}
        </div>
      </section>

      <PasswordResetSection
        title="تغییر رمز عبور موکل"
        subjectName={
          client.fullName
        }
        onReset={(
          password,
        ) =>
          updateClientPassword(
            client.id,
            password,
          )
        }
      />
    </div>
  )
}

function Info({
  label,
  value,
  ltr = false,
}: {
  label: string

  value: string

  ltr?: boolean
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <dt className="text-xs font-bold text-zinc-500">
        {label}
      </dt>

      <dd
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="mt-2 break-words font-bold text-zinc-900"
      >
        {value}
      </dd>
    </div>
  )
}