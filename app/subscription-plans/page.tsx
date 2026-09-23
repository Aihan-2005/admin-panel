'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CheckCircle2,
  Clock3,
  Gift,
  Layers3,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  RefreshCcw,
  Search,
  XCircle,
} from 'lucide-react'

import SubscriptionPlanFormModal from '@/components/subscription-plans/SubscriptionPlanFormModal'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  createSubscriptionPlan,
  getAdminSubscriptionPlans,
  getSubscriptionPlanOptions,
  getSubscriptionSettings,
  updateSubscriptionPlan,
  updateSubscriptionSettings,
} from '@/services/subscription-plan.service'

import type {
  SubscriptionPlan,
  SubscriptionPlanOptions,
  SubscriptionPlanPayload,
} from '@/types/subscription-plan'


type ActiveFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'INACTIVE'


const TIER_LABELS:
  Record<
    string,
    string
  > = {
    BASIC:
      'پایه',

    STANDARD:
      'استاندارد',

    PREMIUM:
      'حرفه‌ای',
  }


function formatNumber(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    'fa-IR',
  ).format(
    value,
  )
}


function formatPrice(
  value:
    number,
): string {
  return `${formatNumber(
    value,
  )} تومان`
}


function formatDuration(
  durationDays:
    number,
): string {
  if (
    durationDays %
      30 ===
    0
  ) {
    return `${formatNumber(
      durationDays /
        30,
    )} ماه`
  }

  if (
    durationDays %
      7 ===
    0
  ) {
    return `${formatNumber(
      durationDays /
        7,
    )} هفته`
  }

  return `${formatNumber(
    durationDays,
  )} روز`
}


function finalPrice(
  plan:
    SubscriptionPlan,
): number {
  return Math.max(
    0,
    Math.round(
      plan.price *
        (
          1 -
          plan.discountPercent /
            100
        ),
    ),
  )
}


export default function SubscriptionPlansPage() {
  const [
    plans,
    setPlans,
  ] =
    useState<
      SubscriptionPlan[]
    >([])

  const [
    options,
    setOptions,
  ] =
    useState<SubscriptionPlanOptions | null>(
      null,
    )

  const [
    trialDays,
    setTrialDays,
  ] =
    useState(
      '',
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    savingTrial,
    setSavingTrial,
  ] =
    useState(false)

  const [
    togglingId,
    setTogglingId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    editingPlan,
    setEditingPlan,
  ] =
    useState<SubscriptionPlan | null>(
      null,
    )

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false)

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    tierFilter,
    setTierFilter,
  ] =
    useState('ALL')

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<ActiveFilter>(
      'ALL',
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    trialError,
    setTrialError,
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


  const loadData =
    useCallback(
      async (
        initial =
          false,
      ) => {
        if (
          initial
        ) {
          setLoading(
            true,
          )
        } else {
          setRefreshing(
            true,
          )
        }

        setError(
          null,
        )

        try {
          const [
            plansResult,
            optionsResult,
            settingsResult,
          ] =
            await Promise.allSettled([
              getAdminSubscriptionPlans(),
              getSubscriptionPlanOptions(),
              getSubscriptionSettings(),
            ])

          if (
            plansResult.status ===
            'rejected'
          ) {
            throw plansResult.reason
          }

          if (
            optionsResult.status ===
            'rejected'
          ) {
            throw optionsResult.reason
          }

          setPlans(
            plansResult.value,
          )

          setOptions(
            optionsResult.value,
          )

          if (
            settingsResult.status ===
            'fulfilled'
          ) {
            setTrialDays(
              String(
                settingsResult
                  .value
                  .trialDays,
              ),
            )

            setTrialError(
              null,
            )
          } else {
            setTrialError(
              settingsResult.reason instanceof
                Error
                ? settingsResult.reason.message
                : 'تنظیمات دوره رایگان در دسترس نیست.',
            )
          }
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پلن‌ها ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )

          setRefreshing(
            false,
          )
        }
      },

      [],
    )


  useEffect(
    () => {
      void loadData(
        true,
      )
    },

    [
      loadData,
    ],
  )


  const stats =
    useMemo(
      () => ({
        total:
          plans.length,

        active:
          plans.filter(
            (
              plan,
            ) =>
              plan.isActive,
          ).length,

        inactive:
          plans.filter(
            (
              plan,
            ) =>
              !plan.isActive,
          ).length,

        tiers:
          new Set(
            plans.map(
              (
                plan,
              ) =>
                plan.tier,
            ),
          ).size,
      }),

      [
        plans,
      ],
    )


  const filteredPlans =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR',
            )

        return plans.filter(
          (
            plan,
          ) => {
            if (
              tierFilter !==
                'ALL' &&
              plan.tier !==
                tierFilter
            ) {
              return false
            }

            if (
              activeFilter ===
                'ACTIVE' &&
              !plan.isActive
            ) {
              return false
            }

            if (
              activeFilter ===
                'INACTIVE' &&
              plan.isActive
            ) {
              return false
            }

            if (
              !query
            ) {
              return true
            }

            return [
              plan.title,
              plan.description,
              plan.tier,
              ...plan.tags,
              ...plan.features,
            ]
              .join(
                ' ',
              )
              .toLocaleLowerCase(
                'fa-IR',
              )
              .includes(
                query,
              )
          },
        )
      },

      [
        plans,
        search,
        tierFilter,
        activeFilter,
      ],
    )


  async function handleSaveTrial() {
    const parsed =
      Number(
        trialDays,
      )

    if (
      !Number.isInteger(
        parsed,
      ) ||
      parsed <
        1 ||
      parsed >
        365
    ) {
      setTrialError(
        'تعداد روزهای رایگان باید بین ۱ تا ۳۶۵ روز باشد.',
      )

      return
    }

    try {
      setSavingTrial(
        true,
      )

      setTrialError(
        null,
      )

      setSuccess(
        null,
      )

      const settings =
        await updateSubscriptionSettings(
          parsed,
        )

      setTrialDays(
        String(
          settings.trialDays,
        ),
      )

      setSuccess(
        'مدت دوره رایگان با موفقیت ذخیره شد.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setTrialError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ذخیره دوره رایگان ناموفق بود.',
      )
    } finally {
      setSavingTrial(
        false,
      )
    }
  }


  async function handleSavePlan(
    input:
      SubscriptionPlanPayload,
  ) {
    try {
      setSaving(
        true,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )

      if (
        editingPlan
      ) {
        await updateSubscriptionPlan(
          editingPlan.id,
          input,
        )

        setSuccess(
          'پلن با موفقیت ویرایش شد.',
        )
      } else {
        await createSubscriptionPlan(
          input,
        )

        setSuccess(
          'پلن با موفقیت ساخته شد.',
        )
      }

      const nextPlans =
        await getAdminSubscriptionPlans()

      setPlans(
        nextPlans,
      )

      setFormOpen(
        false,
      )

      setEditingPlan(
        null,
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ذخیره پلن ناموفق بود.',
      )

      throw caughtError
    } finally {
      setSaving(
        false,
      )
    }
  }


  async function handleToggle(
    plan:
      SubscriptionPlan,
  ) {
    try {
      setTogglingId(
        plan.id,
      )

      const updated =
        await updateSubscriptionPlan(
          plan.id,

          {
            isActive:
              !plan.isActive,
          },
        )

      setPlans(
        (
          current,
        ) =>
          current.map(
            (
              item,
            ) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'تغییر وضعیت پلن ناموفق بود.',
      )
    } finally {
      setTogglingId(
        null,
      )
    }
  }


  if (
    loading
  ) {
    return (
      <LoadingState label="در حال دریافت پلن‌های اشتراکی..." />
    )
  }


  return (
    <>
      <div
        dir="rtl"
        className="mx-auto max-w-7xl space-y-6"
      >
        <section className="rounded-[26px] border border-zinc-200 bg-gradient-to-l from-violet-50 via-white to-blue-50 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-black text-violet-700">
                اشتراک‌ها
              </p>

              <h1 className="mt-1 text-2xl font-black text-zinc-950">
                مدیریت پلن‌های اشتراکی
              </h1>

              <p className="mt-2 text-sm font-semibold leading-7 text-zinc-500">
                پلن‌های قابل خرید و مدت استفاده رایگان کاربران جدید را مدیریت کنید.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  refreshing
                }
                onClick={() => {
                  void loadData()
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-black"
              >
                <RefreshCcw
                  size={17}
                  className={
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }
                />

                بروزرسانی
              </button>

              <button
                type="button"
                disabled={
                  !options
                }
                onClick={() => {
                  setEditingPlan(
                    null,
                  )

                  setFormOpen(
                    true,
                  )
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
              >
                <Plus
                  size={18}
                />

                پلن جدید
              </button>
            </div>
          </div>
        </section>


        <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-blue-700">
                <Gift
                  size={20}
                />

                <h2 className="font-black">
                  دوره رایگان ثبت‌نام اولیه
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                هر وکیلی که برای اولین بار ثبت‌نام می‌کند، این تعداد روز دسترسی رایگان دریافت خواهد کرد.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={
                    trialDays
                  }
                  onChange={(
                    event,
                  ) =>
                    setTrialDays(
                      event.target.value,
                    )
                  }
                  className="h-11 w-40 rounded-xl border border-blue-200 bg-white px-3 pl-12 text-center font-black outline-none focus:border-blue-500"
                  placeholder="14"
                />

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  روز
                </span>
              </div>

              <button
                type="button"
                disabled={
                  savingTrial ||
                  !trialDays
                }
                onClick={() => {
                  void handleSaveTrial()
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-50"
              >
                {
                  savingTrial &&
                  (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )
                }

                ذخیره
              </button>
            </div>
          </div>

          {
            trialError &&
            (
              <p className="mt-3 text-xs font-bold text-red-600">
                {
                  trialError
                }
              </p>
            )
          }
        </section>


        {
          error &&
          (
            <ErrorState
              message={
                error
              }
            />
          )
        }

        {
          success &&
          (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {
                success
              }
            </div>
          )
        }


        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={
              Package
            }
            label="کل پلن‌ها"
            value={
              stats.total
            }
          />

          <StatCard
            icon={
              CheckCircle2
            }
            label="فعال"
            value={
              stats.active
            }
          />

          <StatCard
            icon={
              XCircle
            }
            label="غیرفعال"
            value={
              stats.inactive
            }
          />

          <StatCard
            icon={
              Layers3
            }
            label="سطوح"
            value={
              stats.tiers
            }
          />
        </section>


        <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="جستجو در پلن‌ها..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-11 pl-4 text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={
              tierFilter
            }
            onChange={(
              event,
            ) =>
              setTierFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            <option value="ALL">
              همه سطح‌ها
            </option>

            {
              options?.tiers.map(
                (
                  tier,
                ) => (
                  <option
                    key={
                      tier
                    }
                    value={
                      tier
                    }
                  >
                    {
                      TIER_LABELS[
                        tier
                      ] ??
                      tier
                    }
                  </option>
                ),
              )
            }
          </select>

          <select
            value={
              activeFilter
            }
            onChange={(
              event,
            ) =>
              setActiveFilter(
                event.target
                  .value as ActiveFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            <option value="ALL">
              همه وضعیت‌ها
            </option>

            <option value="ACTIVE">
              فعال
            </option>

            <option value="INACTIVE">
              غیرفعال
            </option>
          </select>
        </section>


        {
          filteredPlans.length ===
          0
            ? (
              <section className="rounded-2xl border border-zinc-200 bg-white">
                <EmptyState message="پلنی پیدا نشد." />
              </section>
            )
            : (
              <section className="grid gap-4 xl:grid-cols-2">
                {
                  filteredPlans.map(
                    (
                      plan,
                    ) => (
                      <article
                        key={
                          plan.id
                        }
                        className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                                {
                                  TIER_LABELS[
                                    plan.tier
                                  ] ??
                                  plan.tier
                                }
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                  plan.isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-zinc-100 text-zinc-500'
                                }`}
                              >
                                {
                                  plan.isActive
                                    ? 'فعال'
                                    : 'غیرفعال'
                                }
                              </span>
                            </div>

                            <h2 className="mt-3 text-xl font-black">
                              {
                                plan.title
                              }
                            </h2>

                            <p className="mt-2 text-sm font-semibold leading-7 text-zinc-500">
                              {
                                plan.description
                              }
                            </p>
                          </div>

                          <div className="shrink-0 text-left">
                            {
                              plan.discountPercent >
                              0 &&
                              (
                                <p className="text-xs text-zinc-400 line-through">
                                  {
                                    formatPrice(
                                      plan.price,
                                    )
                                  }
                                </p>
                              )
                            }

                            <p className="text-xl font-black text-emerald-700">
                              {
                                formatPrice(
                                  finalPrice(
                                    plan,
                                  ),
                                )
                              }
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-zinc-50 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                              <Clock3
                                size={14}
                              />

                              مدت
                            </div>

                            <p className="mt-2 font-black">
                              {
                                formatDuration(
                                  plan.durationDays,
                                )
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-zinc-50 p-3">
                            <p className="text-xs font-bold text-zinc-400">
                              قابلیت‌ها
                            </p>

                            <p className="mt-2 font-black">
                              {
                                formatNumber(
                                  plan.features.length,
                                )
                              }
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {
                            plan.features.map(
                              (
                                featureCode,
                              ) => {
                                const feature =
                                  options?.features.find(
                                    (
                                      item,
                                    ) =>
                                      item.code ===
                                      featureCode,
                                  )

                                return (
                                  <span
                                    key={
                                      featureCode
                                    }
                                    title={
                                      feature
                                        ?.description
                                    }
                                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700"
                                  >
                                    {
                                      feature
                                        ?.title ??
                                      featureCode
                                    }
                                  </span>
                                )
                              },
                            )
                          }
                        </div>

                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlan(
                                plan,
                              )

                              setFormOpen(
                                true,
                              )
                            }}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-black text-white"
                          >
                            <Pencil
                              size={16}
                            />

                            ویرایش
                          </button>

                          <button
                            type="button"
                            disabled={
                              togglingId !==
                              null
                            }
                            onClick={() => {
                              void handleToggle(
                                plan,
                              )
                            }}
                            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-black ${
                              plan.isActive
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {
                              togglingId ===
                              plan.id
                                ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                )
                                : (
                                  <Power
                                    size={16}
                                  />
                                )
                            }

                            {
                              plan.isActive
                                ? 'غیرفعال کردن'
                                : 'فعال کردن'
                            }
                          </button>
                        </div>
                      </article>
                    ),
                  )
                }
              </section>
            )
        }
      </div>

      {
        options &&
        (
          <SubscriptionPlanFormModal
            open={
              formOpen
            }
            plan={
              editingPlan
            }
            options={
              options
            }
            saving={
              saving
            }
            onClose={() => {
              if (
                saving
              ) {
                return
              }

              setFormOpen(
                false,
              )

              setEditingPlan(
                null,
              )
            }}
            onSubmit={
              handleSavePlan
            }
          />
        )
      }
    </>
  )
}


function StatCard({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    LucideIcon

  label:
    string

  value:
    number
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-zinc-500">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {
          label
        }
      </div>

      <p className="mt-3 text-2xl font-black">
        {
          formatNumber(
            value,
          )
        }
      </p>
    </article>
  )
}