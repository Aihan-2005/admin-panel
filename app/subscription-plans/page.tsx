'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Layers3,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  RefreshCcw,
  Search,
  Tags,
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
  updateSubscriptionPlan,
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


function getTierLabel(
  tier:
    string,
): string {
  const label =
    TIER_LABELS[
      tier
    ]


  return label
    ? `${label} (${tier})`
    : tier
}


function calculateFinalPrice(
  plan:
    SubscriptionPlan,
): number {
  if (
    plan.discountPercent <=
    0
  ) {
    return plan.price
  }


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
    >(
      [],
    )


  const [
    options,
    setOptions,
  ] =
    useState<SubscriptionPlanOptions | null>(
      null,
    )


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    )


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    )


  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    )


  const [
    togglingId,
    setTogglingId,
  ] =
    useState<string | null>(
      null,
    )


  const [
    formOpen,
    setFormOpen,
  ] =
    useState(
      false,
    )


  const [
    editingPlan,
    setEditingPlan,
  ] =
    useState<SubscriptionPlan | null>(
      null,
    )


  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    )


  const [
    tierFilter,
    setTierFilter,
  ] =
    useState(
      'ALL',
    )


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
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    )


  const loadAll =
    useCallback(
      async (
        showInitialLoader =
          false,
      ) => {
        if (
          showInitialLoader
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
            planOptions,
            planItems,
          ] =
            await Promise.all([
              getSubscriptionPlanOptions(),

              getAdminSubscriptionPlans(),
            ])


          setOptions(
            planOptions,
          )

          setPlans(
            planItems,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت اطلاعات پلن‌های اشتراکی ناموفق بود.',
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


  const refreshPlans =
    useCallback(
      async () => {
        const items =
          await getAdminSubscriptionPlans()


        setPlans(
          items,
        )
      },

      [],
    )


  useEffect(
    () => {
      void loadAll(
        true,
      )
    },

    [
      loadAll,
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
              item,
            ) =>
              item.isActive,
          ).length,

        inactive:
          plans.filter(
            (
              item,
            ) =>
              !item.isActive,
          ).length,

        tiers:
          new Set(
            plans.map(
              (
                item,
              ) =>
                item.tier,
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


            const haystack =
              [
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


            return haystack.includes(
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


  function openCreate() {
    if (
      !options
    ) {
      setError(
        'ابتدا تنظیمات پلن‌ها باید از Backend دریافت شود.',
      )

      return
    }


    setEditingPlan(
      null,
    )

    setFormOpen(
      true,
    )

    setError(
      null,
    )

    setSuccess(
      null,
    )
  }


  function openEdit(
    plan:
      SubscriptionPlan,
  ) {
    if (
      !options
    ) {
      return
    }


    setEditingPlan(
      plan,
    )

    setFormOpen(
      true,
    )

    setError(
      null,
    )

    setSuccess(
      null,
    )
  }


  function closeForm() {
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
  }


  async function handleSave(
    input:
      SubscriptionPlanPayload,
  ) {
    if (
      saving
    ) {
      return
    }


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
          'پلن اشتراکی با موفقیت ویرایش شد.',
        )
      } else {
        await createSubscriptionPlan(
          input,
        )


        setSuccess(
          'پلن اشتراکی با موفقیت ساخته شد.',
        )
      }


      await refreshPlans()


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
          : 'ذخیره پلن اشتراکی ناموفق بود.',
      )

      throw caughtError
    } finally {
      setSaving(
        false,
      )
    }
  }


  async function handleToggleActive(
    plan:
      SubscriptionPlan,
  ) {
    if (
      togglingId
    ) {
      return
    }


    const nextActive =
      !plan.isActive


    try {
      setTogglingId(
        plan.id,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      const updated =
        await updateSubscriptionPlan(
          plan.id,

          {
            isActive:
              nextActive,
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
              plan.id
                ? updated
                : item,
          ),
      )


      setSuccess(
        nextActive
          ? 'پلن با موفقیت فعال شد.'
          : 'پلن با موفقیت غیرفعال شد.',
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
        <section className="rounded-[26px] border border-zinc-200 bg-gradient-to-l from-violet-50 via-white to-blue-50 p-6 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Package
                  size={25}
                  className="text-violet-600"
                />

                <p className="text-sm font-black text-violet-700">
                  اشتراک‌ها
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-black text-zinc-950 sm:text-3xl">
                مدیریت پلن‌های اشتراکی
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-zinc-500">
                پلن‌های قابل خرید را بسازید، ویژگی‌ها و tier واقعی Backend را انتخاب کنید و وضعیت انتشار آن‌ها را مدیریت کنید.
              </p>
            </div>


            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  refreshing
                }
                onClick={() => {
                  void loadAll()
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                {
                  refreshing
                    ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    )
                    : (
                      <RefreshCcw
                        size={17}
                      />
                    )
                }

                بروزرسانی
              </button>


              <button
                type="button"
                disabled={
                  !options
                }
                onClick={
                  openCreate
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus
                  size={18}
                />

                پلن جدید
              </button>
            </div>
          </div>
        </section>


        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="کل پلن‌ها"
            value={
              stats.total
            }
            icon={
              Package
            }
          />

          <StatCard
            title="پلن فعال"
            value={
              stats.active
            }
            icon={
              CheckCircle2
            }
          />

          <StatCard
            title="پلن غیرفعال"
            value={
              stats.inactive
            }
            icon={
              XCircle
            }
          />

          <StatCard
            title="سطوح استفاده‌شده"
            value={
              stats.tiers
            }
            icon={
              Layers3
            }
          />
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


        {
          !options &&
          !error &&
          (
            <ErrorState message="گزینه‌های tier و features از Backend دریافت نشده‌اند؛ ساخت یا ویرایش پلن غیرفعال است." />
          )
        }


        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_220px]">
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
                placeholder="جستجو در عنوان، توضیحات، ویژگی یا برچسب..."
                className="h-11 w-full rounded-xl border border-zinc-300 pr-11 pl-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-black outline-none focus:border-blue-500"
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
                        getTierLabel(
                          tier,
                        )
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
                  event.target.value as ActiveFilter,
                )
              }
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-black outline-none focus:border-blue-500"
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
          </div>
        </section>


        {
          filteredPlans.length ===
          0
            ? (
              <section className="rounded-2xl border border-zinc-200 bg-white">
                <EmptyState message="پلن اشتراکی پیدا نشد." />
              </section>
            )
            : (
              <section className="grid gap-4 xl:grid-cols-2">
                {
                  filteredPlans.map(
                    (
                      plan,
                    ) => {
                      const finalPrice =
                        calculateFinalPrice(
                          plan,
                        )


                      return (
                        <article
                          key={
                            plan.id
                          }
                          className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                                  {
                                    getTierLabel(
                                      plan.tier,
                                    )
                                  }
                                </span>


                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
                                    plan.isActive
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                                  }`}
                                >
                                  {
                                    plan.isActive
                                      ? 'فعال'
                                      : 'غیرفعال'
                                  }
                                </span>
                              </div>


                              <h2 className="mt-3 text-xl font-black text-zinc-950">
                                {
                                  plan.title
                                }
                              </h2>


                              <p className="mt-2 line-clamp-3 text-sm font-semibold leading-7 text-zinc-500">
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
                                  <p className="text-xs font-bold text-zinc-400 line-through">
                                    {
                                      formatNumber(
                                        plan.price,
                                      )
                                    }
                                  </p>
                                )
                              }

                              <p className="text-xl font-black text-emerald-700">
                                {
                                  formatNumber(
                                    finalPrice,
                                  )
                                }
                              </p>

                              {
                                plan.discountPercent >
                                0 &&
                                (
                                  <p className="mt-1 text-[11px] font-black text-red-600">
                                    {
                                      formatNumber(
                                        plan.discountPercent,
                                      )
                                    }
                                    ٪ تخفیف
                                  </p>
                                )
                              }
                            </div>
                          </div>


                          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <InfoBox
                              icon={
                                Clock3
                              }
                              label="مدت"
                              value={`${formatNumber(
                                plan.durationMonths,
                              )} ماه`}
                            />

                            <InfoBox
                              icon={
                                CircleDollarSign
                              }
                              label="قیمت پایه"
                              value={
                                formatNumber(
                                  plan.price,
                                )
                              }
                            />

                            <InfoBox
                              icon={
                                Layers3
                              }
                              label="اولویت"
                              value={
                                formatNumber(
                                  plan.sortOrder,
                                )
                              }
                            />
                          </div>


                          {
                            plan.tags.length >
                            0 &&
                            (
                              <div className="mt-4">
                                <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500">
                                  <Tags
                                    size={14}
                                  />

                                  برچسب‌ها
                                </div>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {
                                    plan.tags.map(
                                      (
                                        tag,
                                      ) => (
                                        <span
                                          key={
                                            tag
                                          }
                                          className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600"
                                        >
                                          {
                                            tag
                                          }
                                        </span>
                                      ),
                                    )
                                  }
                                </div>
                              </div>
                            )
                          }


                          <div className="mt-4">
                            <p className="text-xs font-black text-zinc-500">
                              قابلیت‌ها
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1.5">
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
                                          feature?.description
                                        }
                                        className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700"
                                      >
                                        {
                                          feature?.title ||
                                          featureCode
                                        }
                                      </span>
                                    )
                                  },
                                )
                              }
                            </div>
                          </div>


                          <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              disabled={
                                !options ||
                                togglingId ===
                                  plan.id
                              }
                              onClick={() =>
                                openEdit(
                                  plan,
                                )
                              }
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                              <Pencil
                                size={16}
                              />

                              ویرایش پلن
                            </button>


                            <button
                              type="button"
                              disabled={
                                togglingId !==
                                null
                              }
                              onClick={() => {
                                void handleToggleActive(
                                  plan,
                                )
                              }}
                              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition disabled:opacity-50 ${
                                plan.isActive
                                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
                      )
                    },
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
            onClose={
              closeForm
            }
            onSubmit={
              handleSave
            }
          />
        )
      }
    </>
  )
}


function StatCard({
  title,
  value,
  icon:
    Icon,
}: {
  title:
    string

  value:
    number

  icon:
    typeof Package
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-zinc-500">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {
          title
        }
      </div>

      <p className="mt-3 text-2xl font-black text-zinc-950">
        {
          formatNumber(
            value,
          )
        }
      </p>
    </article>
  )
}


function InfoBox({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof Package

  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
        <Icon
          size={13}
        />

        {
          label
        }
      </div>

      <p className="mt-1.5 text-sm font-black text-zinc-800">
        {
          value
        }
      </p>
    </div>
  )
}