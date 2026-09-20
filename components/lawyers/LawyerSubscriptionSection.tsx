'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  History,
  Loader2,
  Package,
  PlayCircle,
  RefreshCcw,
  ShieldAlert,
  UserCog,
} from 'lucide-react'

import {
  ErrorState,
} from '@/components/common/PageState'

import {
  activateLawyerSubscription,
  cancelCurrentLawyerSubscription,
  getLawyerSubscriptionHistory,
} from '@/services/lawyer-subscription.service'

import {
  getAdminSubscriptionPlans,
  getSubscriptionPlanOptions,
} from '@/services/subscription-plan.service'

import type {
  LawyerSubscription,
  LawyerSubscriptionActivationSource,
  LawyerSubscriptionStatus,
} from '@/types/lawyer-subscription'

import type {
  SubscriptionPlan,
  SubscriptionPlanOptions,
} from '@/types/subscription-plan'


interface LawyerSubscriptionSectionProps {
  lawyerId:
    string

  lawyerName:
    string
}


const HISTORY_PAGE_SIZE =
  10


const STATUS_LABELS:
  Record<
    LawyerSubscriptionStatus,
    string
  > = {
    ACTIVE:
      'فعال',

    EXPIRED:
      'منقضی‌شده',

    CANCELLED:
      'لغوشده',
  }


const STATUS_CLASSES:
  Record<
    LawyerSubscriptionStatus,
    string
  > = {
    ACTIVE:
      'border-emerald-200 bg-emerald-50 text-emerald-700',

    EXPIRED:
      'border-amber-200 bg-amber-50 text-amber-700',

    CANCELLED:
      'border-red-200 bg-red-50 text-red-700',
  }


const SOURCE_LABELS:
  Record<
    LawyerSubscriptionActivationSource,
    string
  > = {
    ADMIN:
      'فعال‌سازی دستی ادمین',

    PAYMENT:
      'خرید / پرداخت',
  }


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


function formatDateTime(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return '—'
  }


  const date =
    new Date(
      value,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }


  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  )
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


function getFinalPrice(
  plan:
    Pick<
      SubscriptionPlan,
      | 'price'
      | 'discountPercent'
    >,
): number {
  return Math.max(
    0,

    Math.round(
      plan.price *
        (
          1 -
          Math.min(
            100,
            Math.max(
              0,
              plan.discountPercent,
            ),
          ) /
            100
        ),
    ),
  )
}


export default function LawyerSubscriptionSection({
  lawyerId,
  lawyerName,
}: LawyerSubscriptionSectionProps) {
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
    planOptions,
    setPlanOptions,
  ] =
    useState<SubscriptionPlanOptions | null>(
      null,
    )


  const [
    selectedPlanId,
    setSelectedPlanId,
  ] =
    useState(
      '',
    )


  const [
    history,
    setHistory,
  ] =
    useState<
      LawyerSubscription[]
    >(
      [],
    )


  const [
    currentSubscription,
    setCurrentSubscription,
  ] =
    useState<LawyerSubscription | null>(
      null,
    )


  const [
    page,
    setPage,
  ] =
    useState(
      1,
    )


  const [
    totalPages,
    setTotalPages,
  ] =
    useState(
      0,
    )


  const [
    total,
    setTotal,
  ] =
    useState(
      0,
    )


  const [
    catalogLoading,
    setCatalogLoading,
  ] =
    useState(
      true,
    )


  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(
      true,
    )


  const [
    action,
    setAction,
  ] =
    useState<
      'ACTIVATE' |
      'CANCEL' |
      null
    >(
      null,
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
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0,
    )


  const activePlans =
    useMemo(
      () =>
        plans.filter(
          (
            plan,
          ) =>
            plan.isActive,
        ),

      [
        plans,
      ],
    )


  const selectedPlan =
    useMemo(
      () =>
        activePlans.find(
          (
            plan,
          ) =>
            plan.id ===
            selectedPlanId,
        ) ??
        null,

      [
        activePlans,
        selectedPlanId,
      ],
    )


  const featureTitles =
    useMemo(
      () =>
        new Map(
          (
            planOptions
              ?.features ??
            []
          ).map(
            (
              feature,
            ) => [
              feature.code,
              feature.title,
            ],
          ),
        ),

      [
        planOptions,
      ],
    )


  const loadCatalog =
    useCallback(
      async () => {
        try {
          setCatalogLoading(
            true,
          )


          const [
            nextPlans,
            nextOptions,
          ] =
            await Promise.all([
              getAdminSubscriptionPlans(),

              getSubscriptionPlanOptions(),
            ])


          setPlans(
            nextPlans,
          )

          setPlanOptions(
            nextOptions,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پلن‌های اشتراکی ناموفق بود.',
          )
        } finally {
          setCatalogLoading(
            false,
          )
        }
      },

      [],
    )


  const loadHistory =
    useCallback(
      async (
        requestedPage:
          number,
      ) => {
        try {
          setHistoryLoading(
            true,
          )

          setError(
            null,
          )


          const [
            result,
            latestResult,
          ] =
            await Promise.all([
              getLawyerSubscriptionHistory(
                lawyerId,

                {
                  page:
                    requestedPage,

                  limit:
                    HISTORY_PAGE_SIZE,
                },
              ),

              requestedPage ===
              1
                ? Promise.resolve(
                    null,
                  )
                : getLawyerSubscriptionHistory(
                    lawyerId,

                    {
                      page:
                        1,

                      limit:
                        1,
                    },
                  ),
            ])


          setHistory(
            result.items,
          )

          setTotal(
            result.pagination.total,
          )

          setTotalPages(
            result.pagination.totalPages,
          )


          const newestItems =
            latestResult
              ?.items ??
            result.items


          setCurrentSubscription(
            newestItems.find(
              (
                item,
              ) =>
                item.status ===
                'ACTIVE',
            ) ??
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
              : 'دریافت تاریخچه اشتراک وکیل ناموفق بود.',
          )
        } finally {
          setHistoryLoading(
            false,
          )
        }
      },

      [
        lawyerId,
      ],
    )


  useEffect(
    () => {
      void loadCatalog()
    },

    [
      loadCatalog,
    ],
  )


  useEffect(
    () => {
      void loadHistory(
        page,
      )
    },

    [
      loadHistory,
      page,
      refreshKey,
    ],
  )


  useEffect(
    () => {
      if (
        selectedPlanId &&
        activePlans.some(
          (
            plan,
          ) =>
            plan.id ===
            selectedPlanId,
        )
      ) {
        return
      }


      setSelectedPlanId(
        activePlans[0]
          ?.id ??
        '',
      )
    },

    [
      activePlans,
      selectedPlanId,
    ],
  )


  async function handleActivate() {
    if (
      action ||
      currentSubscription ||
      !selectedPlan
    ) {
      return
    }


    const confirmed =
      window.confirm(
        `اشتراک «${selectedPlan.title}» برای ${lawyerName} از همین لحظه فعال شود؟`,
      )


    if (
      !confirmed
    ) {
      return
    }


    try {
      setAction(
        'ACTIVATE',
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      await activateLawyerSubscription(
        lawyerId,
        selectedPlan.id,
      )


      setSuccess(
        'اشتراک وکیل با موفقیت به‌صورت دستی فعال شد.',
      )


      if (
        page !==
        1
      ) {
        setPage(
          1,
        )
      } else {
        setRefreshKey(
          (
            current,
          ) =>
            current +
            1,
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
          : 'فعال‌سازی اشتراک ناموفق بود.',
      )
    } finally {
      setAction(
        null,
      )
    }
  }


  async function handleCancel() {
    if (
      action ||
      !currentSubscription
    ) {
      return
    }


    const confirmed =
      window.confirm(
        `اشتراک فعال ${lawyerName} لغو شود؟ این عملیات رکورد اشتراک را حذف نمی‌کند و در History باقی می‌ماند.`,
      )


    if (
      !confirmed
    ) {
      return
    }


    try {
      setAction(
        'CANCEL',
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      await cancelCurrentLawyerSubscription(
        lawyerId,
      )


      setSuccess(
        'اشتراک فعال وکیل لغو شد و در تاریخچه باقی ماند.',
      )


      if (
        page !==
        1
      ) {
        setPage(
          1,
        )
      } else {
        setRefreshKey(
          (
            current,
          ) =>
            current +
            1,
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
          : 'لغو اشتراک ناموفق بود.',
      )
    } finally {
      setAction(
        null,
      )
    }
  }


  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard
              size={21}
              className="text-violet-600"
            />

            <h2 className="font-black text-zinc-900">
              اشتراک وکیل
            </h2>
          </div>

          <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-zinc-500">
            این بخش برای کنترل مدیریتی و رفع مشکلات احتمالی است. مسیر اصلی فعال‌شدن اشتراک در آینده از خرید و پرداخت خواهد بود.
          </p>
        </div>


        <button
          type="button"
          disabled={
            historyLoading
          }
          onClick={() => {
            setRefreshKey(
              (
                current,
              ) =>
                current +
                1,
            )
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-xs font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCcw
            size={15}
            className={
              historyLoading
                ? 'animate-spin'
                : ''
            }
          />

          بروزرسانی
        </button>
      </div>


      {
        error &&
        (
          <div className="mt-5">
            <ErrorState
              message={
                error
              }
            />
          </div>
        )
      }


      {
        success &&
        (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {
              success
            }
          </div>
        )
      }


      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <CurrentSubscriptionCard
          subscription={
            currentSubscription
          }
          featureTitles={
            featureTitles
          }
          loading={
            historyLoading
          }
          cancelling={
            action ===
            'CANCEL'
          }
          onCancel={
            handleCancel
          }
        />


        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <UserCog
              size={18}
              className="text-blue-600"
            />

            <h3 className="font-black text-zinc-900">
              فعال‌سازی دستی
            </h3>
          </div>


          <p className="mt-2 text-xs font-semibold leading-6 text-zinc-500">
            فقط پلن‌های فعال قابل تخصیص هستند. Backend اجازه ایجاد اشتراک دوم در زمانی که اشتراک فعالی وجود دارد را نمی‌دهد.
          </p>


          {
            catalogLoading
              ? (
                <div className="mt-5 flex h-24 items-center justify-center">
                  <Loader2
                    size={22}
                    className="animate-spin text-blue-600"
                  />
                </div>
              )
              : activePlans.length ===
                0
                ? (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-700">
                    هیچ پلن فعالی وجود ندارد. ابتدا از بخش «پلن‌های اشتراکی» یک پلن را فعال کنید.
                  </div>
                )
                : (
                  <>
                    <label className="mt-5 block">
                      <span className="mb-2 block text-xs font-black text-zinc-600">
                        انتخاب پلن
                      </span>

                      <select
                        value={
                          selectedPlanId
                        }
                        disabled={
                          Boolean(
                            currentSubscription,
                          ) ||
                          action !==
                            null
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedPlanId(
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
                      >
                        {
                          activePlans.map(
                            (
                              plan,
                            ) => (
                              <option
                                key={
                                  plan.id
                                }
                                value={
                                  plan.id
                                }
                              >
                                {
                                  plan.title
                                }
                                {' — '}
                                {
                                  TIER_LABELS[
                                    plan.tier
                                  ] ??
                                  plan.tier
                                }
                                {' — '}
                                {
                                  formatNumber(
                                    plan.durationMonths,
                                  )
                                }
                                {' ماه'}
                              </option>
                            ),
                          )
                        }
                      </select>
                    </label>


                    {
                      selectedPlan &&
                      (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <SmallInfo
                            icon={
                              CalendarClock
                            }
                            label="مدت"
                            value={`${formatNumber(
                              selectedPlan.durationMonths,
                            )} ماه`}
                          />

                          <SmallInfo
                            icon={
                              CircleDollarSign
                            }
                            label="مبلغ نهایی"
                            value={`${formatNumber(
                              getFinalPrice(
                                selectedPlan,
                              ),
                            )} تومان`}
                          />
                        </div>
                      )
                    }


                    <button
                      type="button"
                      disabled={
                        Boolean(
                          currentSubscription,
                        ) ||
                        !selectedPlan ||
                        action !==
                          null
                      }
                      onClick={() => {
                        void handleActivate()
                      }}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {
                        action ===
                        'ACTIVATE'
                          ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          )
                          : (
                            <PlayCircle
                              size={17}
                            />
                          )
                      }

                      {
                        currentSubscription
                          ? 'وکیل اشتراک فعال دارد'
                          : action ===
                              'ACTIVATE'
                            ? 'در حال فعال‌سازی...'
                            : 'فعال‌سازی دستی اشتراک'
                      }
                    </button>
                  </>
                )
          }
        </div>
      </div>


      <div className="mt-7 border-t border-zinc-200 pt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <History
                size={19}
                className="text-zinc-600"
              />

              <h3 className="font-black text-zinc-900">
                تاریخچه اشتراک‌ها
              </h3>
            </div>

            <p className="mt-1 text-xs font-semibold text-zinc-500">
              {
                formatNumber(
                  total,
                )
              }
              {' '}
              رکورد اشتراک ثبت شده است.
            </p>
          </div>
        </div>


        {
          historyLoading
            ? (
              <div className="mt-5 flex min-h-40 items-center justify-center">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-600"
                />
              </div>
            )
            : history.length ===
              0
              ? (
                <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                  <Package
                    size={28}
                    className="mx-auto text-zinc-400"
                  />

                  <p className="mt-3 font-black text-zinc-700">
                    هنوز اشتراکی برای این وکیل ثبت نشده است.
                  </p>
                </div>
              )
              : (
                <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-200">
                  <table className="w-full min-w-[980px] text-right text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 font-black text-zinc-600">
                          پلن
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          وضعیت
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          منبع
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          شروع
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          پایان
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          مبلغ Snapshot
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          قابلیت‌ها
                        </th>
                      </tr>
                    </thead>


                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {
                        history.map(
                          (
                            subscription,
                          ) => (
                            <tr
                              key={
                                subscription.id
                              }
                              className="align-top transition hover:bg-zinc-50"
                            >
                              <td className="px-4 py-4">
                                <p className="font-black text-zinc-900">
                                  {
                                    subscription.planSnapshot.title
                                  }
                                </p>

                                <p className="mt-1 text-xs font-bold text-violet-600">
                                  {
                                    TIER_LABELS[
                                      subscription.planSnapshot.tier
                                    ] ??
                                    subscription.planSnapshot.tier
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-zinc-400">
                                  {
                                    formatNumber(
                                      subscription.planSnapshot.durationMonths,
                                    )
                                  }
                                  {' '}
                                  ماه
                                </p>
                              </td>


                              <td className="px-4 py-4">
                                <StatusBadge
                                  status={
                                    subscription.status
                                  }
                                />

                                {
                                  subscription.cancelledAt &&
                                  (
                                    <p className="mt-2 text-[11px] leading-5 text-zinc-400">
                                      لغو:
                                      {' '}
                                      {
                                        formatDateTime(
                                          subscription.cancelledAt,
                                        )
                                      }
                                    </p>
                                  )
                                }
                              </td>


                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
                                    subscription.activationSource ===
                                    'PAYMENT'
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : 'border-blue-200 bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {
                                    SOURCE_LABELS[
                                      subscription.activationSource
                                    ]
                                  }
                                </span>
                              </td>


                              <td className="px-4 py-4 text-xs font-semibold leading-6 text-zinc-600">
                                {
                                  formatDateTime(
                                    subscription.startsAt,
                                  )
                                }
                              </td>


                              <td className="px-4 py-4 text-xs font-semibold leading-6 text-zinc-600">
                                {
                                  formatDateTime(
                                    subscription.endsAt,
                                  )
                                }
                              </td>


                              <td className="px-4 py-4">
                                <p className="font-black text-zinc-800">
                                  {
                                    formatNumber(
                                      subscription.planSnapshot.price,
                                    )
                                  }
                                  {' '}
                                  تومان
                                </p>

                                {
                                  subscription.planSnapshot.discountPercent >
                                  0 &&
                                  (
                                    <p className="mt-1 text-xs font-bold text-red-600">
                                      {
                                        formatNumber(
                                          subscription.planSnapshot.discountPercent,
                                        )
                                      }
                                      ٪ تخفیف
                                    </p>
                                  )
                                }
                              </td>


                              <td className="px-4 py-4">
                                <div className="flex max-w-xs flex-wrap gap-1.5">
                                  {
                                    subscription.planSnapshot.features.map(
                                      (
                                        code,
                                      ) => (
                                        <span
                                          key={
                                            code
                                          }
                                          title={
                                            code
                                          }
                                          className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-600"
                                        >
                                          {
                                            featureTitles.get(
                                              code,
                                            ) ??
                                            code
                                          }
                                        </span>
                                      ),
                                    )
                                  }
                                </div>
                              </td>
                            </tr>
                          ),
                        )
                      }
                    </tbody>
                  </table>
                </div>
              )
        }


        {
          totalPages >
          1 &&
          (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-zinc-500">
                صفحه
                {' '}
                {
                  formatNumber(
                    page,
                  )
                }
                {' '}
                از
                {' '}
                {
                  formatNumber(
                    totalPages,
                  )
                }
              </p>


              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    page <=
                      1 ||
                    historyLoading
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-black disabled:opacity-40"
                >
                  <ChevronRight
                    size={15}
                  />

                  قبلی
                </button>


                <button
                  type="button"
                  disabled={
                    page >=
                      totalPages ||
                    historyLoading
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.min(
                          totalPages,
                          current +
                            1,
                        ),
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-black disabled:opacity-40"
                >
                  بعدی

                  <ChevronLeft
                    size={15}
                  />
                </button>
              </div>
            </div>
          )
        }
      </div>
    </section>
  )
}


function CurrentSubscriptionCard({
  subscription,
  featureTitles,
  loading,
  cancelling,
  onCancel,
}: {
  subscription:
    LawyerSubscription | null

  featureTitles:
    Map<
      string,
      string
    >

  loading:
    boolean

  cancelling:
    boolean

  onCancel:
    () => void |
    Promise<void>
}) {
  if (
    loading
  ) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
        <Loader2
          size={24}
          className="animate-spin text-violet-600"
        />
      </div>
    )
  }


  if (
    !subscription
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-200 text-zinc-600">
          <Ban
            size={20}
          />
        </div>

        <h3 className="mt-4 font-black text-zinc-900">
          اشتراک فعال ندارد
        </h3>

        <p className="mt-2 text-sm font-semibold leading-7 text-zinc-500">
          این وکیل در حال حاضر اشتراک فعال ندارد و می‌توانید از بخش فعال‌سازی دستی یک پلن به او اختصاص دهید.
        </p>
      </div>
    )
  }


  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2
              size={19}
            />

            <span className="text-xs font-black">
              اشتراک فعال
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-zinc-950">
            {
              subscription.planSnapshot.title
            }
          </h3>

          <p className="mt-1 text-xs font-black text-violet-700">
            {
              TIER_LABELS[
                subscription.planSnapshot.tier
              ] ??
              subscription.planSnapshot.tier
            }
          </p>
        </div>


        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-black ${
            subscription.activationSource ===
            'PAYMENT'
              ? 'border-emerald-200 bg-white text-emerald-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {
            SOURCE_LABELS[
              subscription.activationSource
            ]
          }
        </span>
      </div>


      <div className="mt-5 grid grid-cols-2 gap-2">
        <SmallInfo
          icon={
            Clock3
          }
          label="شروع"
          value={
            formatDateTime(
              subscription.startsAt,
            )
          }
        />

        <SmallInfo
          icon={
            CalendarClock
          }
          label="پایان"
          value={
            formatDateTime(
              subscription.endsAt,
            )
          }
        />
      </div>


      {
        subscription.planSnapshot.features.length >
        0 &&
        (
          <div className="mt-4">
            <p className="text-xs font-black text-zinc-500">
              قابلیت‌های فعال
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {
                subscription.planSnapshot.features.map(
                  (
                    code,
                  ) => (
                    <span
                      key={
                        code
                      }
                      title={
                        code
                      }
                      className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800"
                    >
                      {
                        featureTitles.get(
                          code,
                        ) ??
                        code
                      }
                    </span>
                  ),
                )
              }
            </div>
          </div>
        )
      }


      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3">
        <div className="flex items-start gap-2">
          <ShieldAlert
            size={17}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-xs font-semibold leading-6 text-red-700">
            لغو دستی فوراً دسترسی این اشتراک را پایان می‌دهد، اما رکورد و Snapshot پلن در تاریخچه باقی می‌ماند.
          </p>
        </div>


        <button
          type="button"
          disabled={
            cancelling
          }
          onClick={() => {
            void onCancel()
          }}
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {
            cancelling
              ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )
              : (
                <Ban
                  size={15}
                />
              )
          }

          {
            cancelling
              ? 'در حال لغو...'
              : 'لغو اشتراک فعلی'
          }
        </button>
      </div>
    </div>
  )
}


function StatusBadge({
  status,
}: {
  status:
    LawyerSubscriptionStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
        STATUS_CLASSES[
          status
        ]
      }`}
    >
      {
        STATUS_LABELS[
          status
        ]
      }
    </span>
  )
}


function SmallInfo({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof Clock3

  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-400">
        <Icon
          size={13}
        />

        {
          label
        }
      </div>

      <p className="mt-1.5 text-xs font-black leading-6 text-zinc-800">
        {
          value
        }
      </p>
    </div>
  )
}

