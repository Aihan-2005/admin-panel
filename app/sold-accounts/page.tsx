'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { LucideIcon } from 'lucide-react'

import {
  ArrowUpDown,
  BadgeDollarSign,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  PackageCheck,
  Search,
  X,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import { getSoldAccounts } from '@/services/sold-account.service'

import type { SoldAccount } from '@/types/sold-account'

type SortField =
  | 'buyerFullName'
  | 'soldAt'
  | 'amount'
  | 'expiresAt'

type SortDirection =
  | 'asc'
  | 'desc'

type LifecycleFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'NO_EXPIRY'

const PAGE_SIZE = 10

function formatNumber(
  value?: number | null,
) {
  if (
    value === undefined ||
    value === null
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'fa-IR',
  ).format(value)
}

function formatDate(
  value?: string | null,
  includeTime = false,
) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }

  return includeTime
    ? date.toLocaleString(
        'fa-IR',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        },
      )
    : date.toLocaleDateString(
        'fa-IR',
      )
}

function getLifecycle(
  item: SoldAccount,
): Exclude<
  LifecycleFilter,
  'ALL'
> {
  if (!item.expiresAt) {
    return 'NO_EXPIRY'
  }

  return new Date(
    item.expiresAt,
  ).getTime() < Date.now()
    ? 'EXPIRED'
    : 'ACTIVE'
}

function getStatusStyle(
  status?: string | null,
) {
  const normalized =
    status
      ?.trim()
      .toUpperCase()

  if (normalized === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (normalized === 'EXPIRED') {
    return 'border-zinc-200 bg-zinc-100 text-zinc-600'
  }

  if (
    normalized ===
      'CANCELLED' ||
    normalized ===
      'CANCELED' ||
    normalized ===
      'SUSPENDED'
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (normalized === 'PENDING') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-600'
}

export default function SoldAccountsPage() {
  const [
    items,
    setItems,
  ] = useState<
    SoldAccount[]
  >([])

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    packageFilter,
    setPackageFilter,
  ] = useState('ALL')

  const [
    lifecycleFilter,
    setLifecycleFilter,
  ] =
    useState<LifecycleFilter>(
      'ALL',
    )

  const [
    sortField,
    setSortField,
  ] =
    useState<SortField>(
      'soldAt',
    )

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      'desc',
    )

  const [
    page,
    setPage,
  ] = useState(1)

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<SoldAccount | null>(
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

    getSoldAccounts()
      .then((data) => {
        if (active) {
          setItems(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت لیست اکانت‌های فروخته‌شده',
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
  }, [])

  const packageOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          items
            .map(
              (item) =>
                item.packageTitle?.trim(),
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      ).sort((a, b) =>
        a.localeCompare(
          b,
          'fa-IR',
        ),
      )
    }, [items])

  const stats = useMemo(() => {
    const now = Date.now()

    const thirtyDays =
      30 *
      24 *
      60 *
      60 *
      1000

    return {
      total: items.length,

      totalAmount:
        items.reduce(
          (sum, item) =>
            sum +
            (item.amount ??
              0),
          0,
        ),

      active:
        items.filter(
          (item) =>
            getLifecycle(
              item,
            ) === 'ACTIVE',
        ).length,

      expiringSoon:
        items.filter(
          (item) => {
            if (
              !item.expiresAt
            ) {
              return false
            }

            const expiresAt =
              new Date(
                item.expiresAt,
              ).getTime()

            return (
              expiresAt >= now &&
              expiresAt -
                now <=
                thirtyDays
            )
          },
        ).length,
    }
  }, [items])

  const filteredItems =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      return [...items]
        .filter(
          (item) => {
            const matchesSearch =
              !query ||
              [
                item.id,
                item.buyerFullName,
                item.phone,
                item.email,
                item.packageTitle,
                item.accountType,
                item.status,
              ].some((value) =>
                value
                  ?.toLocaleLowerCase(
                    'fa-IR',
                  )
                  .includes(
                    query,
                  ),
              )

            const matchesPackage =
              packageFilter ===
                'ALL' ||
              item.packageTitle ===
                packageFilter

            const matchesLifecycle =
              lifecycleFilter ===
                'ALL' ||
              getLifecycle(
                item,
              ) ===
                lifecycleFilter

            return Boolean(
              matchesSearch &&
                matchesPackage &&
                matchesLifecycle,
            )
          },
        )
        .sort((a, b) => {
          let comparison = 0

          if (
            sortField ===
            'buyerFullName'
          ) {
            comparison =
              a.buyerFullName.localeCompare(
                b.buyerFullName,
                'fa-IR',
              )
          }

          if (
            sortField ===
            'soldAt'
          ) {
            comparison =
              new Date(
                a.soldAt,
              ).getTime() -
              new Date(
                b.soldAt,
              ).getTime()
          }

          if (
            sortField ===
            'amount'
          ) {
            comparison =
              (a.amount ??
                0) -
              (b.amount ??
                0)
          }

          if (
            sortField ===
            'expiresAt'
          ) {
            const aTime =
              a.expiresAt
                ? new Date(
                    a.expiresAt,
                  ).getTime()
                : Number.MAX_SAFE_INTEGER

            const bTime =
              b.expiresAt
                ? new Date(
                    b.expiresAt,
                  ).getTime()
                : Number.MAX_SAFE_INTEGER

            comparison =
              aTime -
              bTime
          }

          return sortDirection ===
            'asc'
            ? comparison
            : -comparison
        })
    }, [
      items,
      lifecycleFilter,
      packageFilter,
      search,
      sortDirection,
      sortField,
    ])

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredItems.length /
          PAGE_SIZE,
      ),
    )

  const currentPage =
    Math.min(
      page,
      totalPages,
    )

  const paginatedItems =
    filteredItems.slice(
      (currentPage - 1) *
        PAGE_SIZE,

      currentPage *
        PAGE_SIZE,
    )

  useEffect(() => {
    setPage(1)
  }, [
    search,
    packageFilter,
    lifecycleFilter,
    sortField,
    sortDirection,
  ])

  function toggleSort(
    field: SortField,
  ) {
    if (
      sortField === field
    ) {
      setSortDirection(
        (current) =>
          current === 'asc'
            ? 'desc'
            : 'asc',
      )

      return
    }

    setSortField(field)

    setSortDirection(
      field ===
        'buyerFullName'
        ? 'asc'
        : 'desc',
    )
  }

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-950">
            اکانت‌های فروخته‌شده
          </h1>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            مشاهده خریدارها،
            پلن‌ها، مبلغ فروش و
            وضعیت انقضای اکانت‌ها
          </p>
        </div>

        <div className="text-xs font-bold text-zinc-400">
          {new Intl.NumberFormat(
            'fa-IR',
          ).format(
            filteredItems.length,
          )}{' '}
          رکورد
        </div>
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل فروش‌ها"
          value={formatNumber(
            stats.total,
          )}
          icon={
            BadgeDollarSign
          }
          iconClassName="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="مجموع مبلغ"
          value={formatNumber(
            stats.totalAmount,
          )}
          icon={
            CircleDollarSign
          }
          iconClassName="bg-emerald-50 text-emerald-700"
        />

        <StatCard
          title="دارای انقضای فعال"
          value={formatNumber(
            stats.active,
          )}
          icon={PackageCheck}
          iconClassName="bg-violet-50 text-violet-700"
        />

        <StatCard
          title="انقضا تا ۳۰ روز آینده"
          value={formatNumber(
            stats.expiringSoon,
          )}
          icon={
            CalendarClock
          }
          iconClassName="bg-amber-50 text-amber-700"
        />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-100">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="جستجو در نام خریدار، تماس، شناسه، پلن یا وضعیت..."
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={
              packageFilter
            }
            onChange={(
              event,
            ) =>
              setPackageFilter(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه پلن‌ها
            </option>

            {packageOptions.map(
              (
                packageTitle,
              ) => (
                <option
                  key={
                    packageTitle
                  }
                  value={
                    packageTitle
                  }
                >
                  {
                    packageTitle
                  }
                </option>
              ),
            )}
          </select>

          <select
            value={
              lifecycleFilter
            }
            onChange={(
              event,
            ) =>
              setLifecycleFilter(
                event.target
                  .value as LifecycleFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه وضعیت‌های انقضا
            </option>

            <option value="ACTIVE">
              دارای انقضای فعال
            </option>

            <option value="EXPIRED">
              منقضی‌شده
            </option>

            <option value="NO_EXPIRY">
              بدون تاریخ انقضا
            </option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100">
        {isLoading ? (
          <LoadingState label="در حال دریافت فروش‌ها..." />
        ) : paginatedItems.length ===
          0 ? (
          <EmptyState message="هیچ اکانت فروخته‌شده‌ای با این فیلتر پیدا نشد." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80">
                  <tr>
                    <SortableHead
                      label="خریدار"
                      active={
                        sortField ===
                        'buyerFullName'
                      }
                      onClick={() =>
                        toggleSort(
                          'buyerFullName',
                        )
                      }
                    />

                    <th className="px-4 py-3 font-black text-zinc-600">
                      تماس
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      نوع اکانت
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      پلن
                    </th>

                    <SortableHead
                      label="مبلغ"
                      active={
                        sortField ===
                        'amount'
                      }
                      onClick={() =>
                        toggleSort(
                          'amount',
                        )
                      }
                    />

                    <SortableHead
                      label="تاریخ فروش"
                      active={
                        sortField ===
                        'soldAt'
                      }
                      onClick={() =>
                        toggleSort(
                          'soldAt',
                        )
                      }
                    />

                    <SortableHead
                      label="انقضا"
                      active={
                        sortField ===
                        'expiresAt'
                      }
                      onClick={() =>
                        toggleSort(
                          'expiresAt',
                        )
                      }
                    />

                    <th className="px-4 py-3 font-black text-zinc-600">
                      وضعیت
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {paginatedItems.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-black text-zinc-900">
                            {
                              item.buyerFullName
                            }
                          </div>

                          <div
                            dir="ltr"
                            className="mt-1 w-fit text-xs text-zinc-400"
                          >
                            {
                              item.id
                            }
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div
                            dir="ltr"
                            className="w-fit text-zinc-700"
                          >
                            {item.phone ||
                              item.email ||
                              '—'}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-zinc-700">
                          {item.accountType ||
                            '—'}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-zinc-800">
                          {item.packageTitle ||
                            '—'}
                        </td>

                        <td className="px-4 py-3.5 font-black tabular-nums text-zinc-900">
                          {formatNumber(
                            item.amount,
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-zinc-600">
                          {formatDate(
                            item.soldAt,
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-zinc-600">
                          {formatDate(
                            item.expiresAt,
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${getStatusStyle(
                              item.status,
                            )}`}
                          >
                            {item.status ||
                              'نامشخص'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItem(
                                item,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                            جزئیات
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                setPage
              }
            />
          </>
        )}
      </section>

      {selectedItem && (
        <DetailsModal
          item={
            selectedItem
          }
          onClose={() =>
            setSelectedItem(
              null,
            )
          }
        />
      )}
    </div>
  )
}

function SortableHead({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <th className="px-4 py-3 font-black text-zinc-600">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 transition hover:text-zinc-950 ${
          active
            ? 'text-blue-700'
            : ''
        }`}
      >
        {label}

        <ArrowUpDown
          size={14}
        />
      </button>
    </th>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: {
  title: string
  value: string
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-zinc-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-zinc-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (
    page: number,
  ) => void
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
      <span className="text-xs font-bold text-zinc-500">
        صفحه{' '}
        {new Intl.NumberFormat(
          'fa-IR',
        ).format(page)}{' '}
        از{' '}
        {new Intl.NumberFormat(
          'fa-IR',
        ).format(
          totalPages,
        )}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(
              page - 1,
            )
          }
          className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="صفحه قبلی"
        >
          <ChevronRight
            size={17}
          />
        </button>

        <button
          type="button"
          disabled={
            page >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              page + 1,
            )
          }
          className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="صفحه بعدی"
        >
          <ChevronLeft
            size={17}
          />
        </button>
      </div>
    </div>
  )
}

function DetailsModal({
  item,
  onClose,
}: {
  item: SoldAccount
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="جزئیات اکانت فروخته‌شده"
    >
      <button
        type="button"
        aria-label="بستن پنجره"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 p-5">
          <div>
            <h2 className="text-lg font-black text-zinc-950">
              جزئیات فروش
            </h2>

            <p
              dir="ltr"
              className="mt-1 w-fit text-xs text-zinc-400"
            >
              {item.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        <dl className="grid gap-3 p-5 sm:grid-cols-2">
          <DetailRow
            label="نام خریدار"
            value={
              item.buyerFullName
            }
          />

          <DetailRow
            label="شماره تماس"
            value={
              item.phone ||
              '—'
            }
            ltr
          />

          <DetailRow
            label="ایمیل"
            value={
              item.email ||
              '—'
            }
            ltr
          />

          <DetailRow
            label="نوع اکانت"
            value={
              item.accountType ||
              '—'
            }
          />

          <DetailRow
            label="پلن"
            value={
              item.packageTitle ||
              '—'
            }
          />

          <DetailRow
            label="مبلغ"
            value={formatNumber(
              item.amount,
            )}
          />

          <DetailRow
            label="تاریخ فروش"
            value={formatDate(
              item.soldAt,
              true,
            )}
          />

          <DetailRow
            label="تاریخ انقضا"
            value={formatDate(
              item.expiresAt,
              true,
            )}
          />

          <DetailRow
            label="وضعیت"
            value={
              item.status ||
              'نامشخص'
            }
          />

          <DetailRow
            label="وضعیت انقضا"
            value={
              getLifecycle(
                item,
              ) === 'ACTIVE'
                ? 'فعال'
                : getLifecycle(
                      item,
                    ) ===
                    'EXPIRED'
                  ? 'منقضی‌شده'
                  : 'بدون تاریخ انقضا'
            }
          />
        </dl>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  ltr = false,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <dt className="text-xs font-bold text-zinc-500">
        {label}
      </dt>

      <dd
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="mt-2 break-words text-sm font-black text-zinc-900"
      >
        {value}
      </dd>
    </div>
  )
}