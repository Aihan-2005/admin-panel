'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  BriefcaseBusiness,
  MessageSquareText,
  Scale,
  Users,
} from 'lucide-react'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  getDashboard,
} from '@/services/dashboard.service'

import type {
  DashboardStats,
} from '@/types/dashboard'

export default function AdminHomePage() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardStats | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
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

    getDashboard()
      .then((data) => {
        if (active) {
          setDashboard(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت داشبورد',
          )
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(
            false,
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (isLoading) {
    return (
      <LoadingState label="در حال دریافت اطلاعات داشبورد..." />
    )
  }

  if (
    !dashboard ||
    error
  ) {
    return (
      <ErrorState
        message={
          error ??
          'اطلاعات داشبورد در دسترس نیست.'
        }
      />
    )
  }

  const cards = [
    {
      title:
        'کل وکلا',

      value:
        dashboard.accounts
          .lawyers.total,

      description: `${
        dashboard
          .lawyerProfiles
          .pendingVerification
      } وکیل در انتظار احراز`,

      icon: Scale,
    },

    {
      title:
        'کل موکلین',

      value:
        dashboard.accounts
          .clients.total,

      description: `${
        dashboard.accounts
          .clients.active
      } حساب فعال`,

      icon: Users,
    },

    {
      title:
        'تیکت‌ها',

      value:
        dashboard.tickets
          .total,

      description: `${
        dashboard.tickets
          .open
      } تیکت باز`,

      icon:
        MessageSquareText,
    },

    {
      title:
        'وکلا فعال',

      value:
        dashboard
          .lawyerProfiles
          .active,

      description: `${
        dashboard
          .lawyerProfiles
          .suspended
      } وکیل معلق`,

      icon:
        BriefcaseBusiness,
    },
  ]

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-black text-zinc-950">
          داشبورد مدیریت
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          نمای کلی وضعیت سامانه
          دادیار
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          (card) => {
            const Icon =
              card.icon

            return (
              <article
                key={
                  card.title
                }
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-500">
                      {
                        card.title
                      }
                    </p>

                    <p className="mt-3 text-3xl font-black text-zinc-950">
                      {new Intl.NumberFormat(
                        'fa-IR',
                      ).format(
                        card.value,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon
                      size={21}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs font-bold text-zinc-400">
                  {
                    card.description
                  }
                </p>
              </article>
            )
          },
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">
            وضعیت وکلا
          </h2>

          <StatsRow
            label="در انتظار احراز"
            value={
              dashboard
                .lawyerProfiles
                .pendingVerification
            }
          />

          <StatsRow
            label="فعال"
            value={
              dashboard
                .lawyerProfiles
                .active
            }
          />

          <StatsRow
            label="معلق"
            value={
              dashboard
                .lawyerProfiles
                .suspended
            }
          />

          <StatsRow
            label="رد شده"
            value={
              dashboard
                .lawyerProfiles
                .rejected
            }
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">
            وضعیت تیکت‌ها
          </h2>

          <StatsRow
            label="باز"
            value={
              dashboard.tickets
                .open
            }
          />

          <StatsRow
            label="در حال بررسی"
            value={
              dashboard.tickets
                .inProgress
            }
          />

          <StatsRow
            label="در انتظار وکیل"
            value={
              dashboard.tickets
                .waitingForLawyer
            }
          />

          <StatsRow
            label="حل شده"
            value={
              dashboard.tickets
                .resolved
            }
          />
        </section>
      </div>
    </div>
  )
}

function StatsRow({
  label,
  value,
}: {
  label: string

  value: number
}) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
      <span className="text-sm font-bold text-zinc-600">
        {label}
      </span>

      <span className="font-black text-zinc-950">
        {new Intl.NumberFormat(
          'fa-IR',
        ).format(value)}
      </span>
    </div>
  )
}