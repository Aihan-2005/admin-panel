'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { LucideIcon } from 'lucide-react'

import {
  ArrowUpDown,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  UserCheck,
  UserMinus,
  X,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import { getCases } from '@/services/case.service'

import type { LegalCase } from '@/types/case'

type SortField =
  | 'title'
  | 'createdAt'
  | 'updatedAt'

type SortDirection =
  | 'asc'
  | 'desc'

type AssignmentFilter =
  | 'ALL'
  | 'ASSIGNED'
  | 'UNASSIGNED'

const PAGE_SIZE = 10

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

function getCaseStatusStyle(
  status?: string | null,
) {
  const normalized =
    status
      ?.trim()
      .toUpperCase()

  if (!normalized) {
    return 'border-zinc-200 bg-zinc-50 text-zinc-500'
  }

  if (
    [
      'ACTIVE',
      'OPEN',
      'IN_PROGRESS',
    ].includes(normalized)
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }

  if (
    [
      'CLOSED',
      'COMPLETED',
      'DONE',
      'RESOLVED',
    ].includes(normalized)
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (
    [
      'CANCELLED',
      'CANCELED',
      'REJECTED',
    ].includes(normalized)
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (
    [
      'PENDING',
      'WAITING',
    ].includes(normalized)
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default function CasesPage() {
  const [
    cases,
    setCases,
  ] =
    useState<LegalCase[]>(
      [],
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ALL')

  const [
    assignmentFilter,
    setAssignmentFilter,
  ] =
    useState<AssignmentFilter>(
      'ALL',
    )

  const [
    sortField,
    setSortField,
  ] =
    useState<SortField>(
      'updatedAt',
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
    selectedCase,
    setSelectedCase,
  ] =
    useState<LegalCase | null>(
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

    getCases()
      .then((data) => {
        if (active) {
          setCases(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت پرونده‌ها',
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

  const statusOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          cases
            .map(
              (item) =>
                item.status?.trim(),
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
    }, [cases])

  const stats =
    useMemo(() => {
      const sevenDaysAgo =
        Date.now() -
        7 *
          24 *
          60 *
          60 *
          1000

      return {
        total:
          cases.length,

        assigned:
          cases.filter(
            (item) =>
              Boolean(
                item.lawyerName?.trim(),
              ),
          ).length,

        unassigned:
          cases.filter(
            (item) =>
              !item.lawyerName?.trim(),
          ).length,

        recentlyUpdated:
          cases.filter(
            (item) => {
              const value =
                item.updatedAt ??
                item.createdAt

              const timestamp =
                new Date(
                  value,
                ).getTime()

              return (
                !Number.isNaN(
                  timestamp,
                ) &&
                timestamp >=
                  sevenDaysAgo
              )
            },
          ).length,
      }
    }, [cases])

  const filteredCases =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      return [...cases]
        .filter(
          (item) => {
            const matchesSearch =
              !query ||
              [
                item.id,
                item.title,
                item.caseNumber,
                item.clientName,
                item.lawyerName,
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

            const matchesStatus =
              statusFilter ===
                'ALL' ||
              item.status ===
                statusFilter

            const hasLawyer =
              Boolean(
                item.lawyerName?.trim(),
              )

            const matchesAssignment =
              assignmentFilter ===
                'ALL' ||
              (assignmentFilter ===
                'ASSIGNED' &&
                hasLawyer) ||
              (assignmentFilter ===
                'UNASSIGNED' &&
                !hasLawyer)

            return Boolean(
              matchesSearch &&
                matchesStatus &&
                matchesAssignment,
            )
          },
        )
        .sort((a, b) => {
          let comparison = 0

          if (
            sortField ===
            'title'
          ) {
            comparison =
              a.title.localeCompare(
                b.title,
                'fa-IR',
              )
          }

          if (
            sortField ===
            'createdAt'
          ) {
            comparison =
              new Date(
                a.createdAt,
              ).getTime() -
              new Date(
                b.createdAt,
              ).getTime()
          }

          if (
            sortField ===
            'updatedAt'
          ) {
            comparison =
              new Date(
                a.updatedAt ??
                  a.createdAt,
              ).getTime() -
              new Date(
                b.updatedAt ??
                  b.createdAt,
              ).getTime()
          }

          return sortDirection ===
            'asc'
            ? comparison
            : -comparison
        })
    }, [
      assignmentFilter,
      cases,
      search,
      sortDirection,
      sortField,
      statusFilter,
    ])

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredCases.length /
          PAGE_SIZE,
      ),
    )

  const currentPage =
    Math.min(
      page,
      totalPages,
    )

  const paginatedCases =
    filteredCases.slice(
      (currentPage - 1) *
        PAGE_SIZE,

      currentPage *
        PAGE_SIZE,
    )

  useEffect(() => {
    setPage(1)
  }, [
    search,
    statusFilter,
    assignmentFilter,
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
      field === 'title'
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
            پرونده‌ها
          </h1>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            نمای مدیریتی و
            فقط‌خواندنی برای
            پشتیبانی، بررسی اختلافات
            و کنترل پرونده‌ها
          </p>
        </div>

        <div className="text-xs font-bold text-zinc-400">
          {new Intl.NumberFormat(
            'fa-IR',
          ).format(
            filteredCases.length,
          )}{' '}
          پرونده
        </div>
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل پرونده‌ها"
          value={
            stats.total
          }
          icon={
            BriefcaseBusiness
          }
          iconClassName="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="دارای وکیل"
          value={
            stats.assigned
          }
          icon={UserCheck}
          iconClassName="bg-emerald-50 text-emerald-700"
        />

        <StatCard
          title="بدون وکیل"
          value={
            stats.unassigned
          }
          icon={UserMinus}
          iconClassName="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="بروزشده در ۷ روز اخیر"
          value={
            stats.recentlyUpdated
          }
          icon={CalendarDays}
          iconClassName="bg-violet-50 text-violet-700"
        />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-100">
        <div className="grid gap-3 lg:grid-cols-[minmax(300px,1fr)_220px_220px]">
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
              placeholder="جستجو در عنوان، شماره پرونده، وکیل، موکل یا شناسه..."
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event,
            ) =>
              setStatusFilter(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه وضعیت‌ها
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {status}
                </option>
              ),
            )}
          </select>

          <select
            value={
              assignmentFilter
            }
            onChange={(
              event,
            ) =>
              setAssignmentFilter(
                event.target
                  .value as AssignmentFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه پرونده‌ها
            </option>

            <option value="ASSIGNED">
              دارای وکیل
            </option>

            <option value="UNASSIGNED">
              بدون وکیل
            </option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100">
        {isLoading ? (
          <LoadingState label="در حال دریافت پرونده‌ها..." />
        ) : paginatedCases.length ===
          0 ? (
          <EmptyState message="پرونده‌ای با این فیلتر پیدا نشد." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-right text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80">
                  <tr>
                    <SortableHead
                      label="عنوان پرونده"
                      active={
                        sortField ===
                        'title'
                      }
                      onClick={() =>
                        toggleSort(
                          'title',
                        )
                      }
                    />

                    <th className="px-4 py-3 font-black text-zinc-600">
                      شماره پرونده
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      موکل
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      وکیل
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      وضعیت
                    </th>

                    <SortableHead
                      label="تاریخ ایجاد"
                      active={
                        sortField ===
                        'createdAt'
                      }
                      onClick={() =>
                        toggleSort(
                          'createdAt',
                        )
                      }
                    />

                    <SortableHead
                      label="آخرین بروزرسانی"
                      active={
                        sortField ===
                        'updatedAt'
                      }
                      onClick={() =>
                        toggleSort(
                          'updatedAt',
                        )
                      }
                    />

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {paginatedCases.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3.5">
                          <div className="max-w-[260px] truncate font-black text-zinc-900">
                            {
                              item.title
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

                        <td className="px-4 py-3.5 font-bold text-zinc-700">
                          {item.caseNumber ||
                            '—'}
                        </td>

                        <td className="px-4 py-3.5 text-zinc-700">
                          {item.clientName ||
                            '—'}
                        </td>

                        <td className="px-4 py-3.5 text-zinc-700">
                          {item.lawyerName || (
                            <span className="text-xs font-bold text-amber-700">
                              تخصیص داده
                              نشده
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${getCaseStatusStyle(
                              item.status,
                            )}`}
                          >
                            {item.status ||
                              'نامشخص'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-zinc-500">
                          {formatDate(
                            item.createdAt,
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-zinc-500">
                          {formatDate(
                            item.updatedAt ??
                              item.createdAt,
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCase(
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

      {selectedCase && (
        <CaseDetailsModal
          item={
            selectedCase
          }
          onClose={() =>
            setSelectedCase(
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
  value: number
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
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(value)}
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

function CaseDetailsModal({
  item,
  onClose,
}: {
  item: LegalCase
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="جزئیات پرونده"
    >
      <button
        type="button"
        aria-label="بستن پنجره"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-zinc-950">
              {item.title}
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
            label="شماره پرونده"
            value={
              item.caseNumber ||
              '—'
            }
          />

          <DetailRow
            label="وضعیت"
            value={
              item.status ||
              'نامشخص'
            }
          />

          <DetailRow
            label="موکل"
            value={
              item.clientName ||
              '—'
            }
          />

          <DetailRow
            label="وکیل"
            value={
              item.lawyerName ||
              'تخصیص داده نشده'
            }
          />

          <DetailRow
            label="تاریخ ایجاد"
            value={formatDate(
              item.createdAt,
              true,
            )}
          />

          <DetailRow
            label="آخرین بروزرسانی"
            value={formatDate(
              item.updatedAt ??
                item.createdAt,
              true,
            )}
          />
        </dl>

        <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-4 text-xs leading-5 text-zinc-500">
          این بخش فعلاً
          فقط‌خواندنی است. بعد از
          مشخص شدن API پرونده،
          می‌توان جزئیات کامل،
          اسناد، جلسات و تاریخچه
          تغییرات را به همین صفحه
          اضافه کرد.
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <dt className="text-xs font-bold text-zinc-500">
        {label}
      </dt>

      <dd className="mt-2 break-words text-sm font-black text-zinc-900">
        {value}
      </dd>
    </div>
  )
}