'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowUpDown,
  Plus,
  Search,
} from 'lucide-react'

import {
  AccountStatusBadge,
} from '@/components/common/AccountStatusBadge'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  CreateLawyerModal,
} from '@/components/lawyers/CreateLawyerModal'

import {
  LawyerStatusBadge,
} from '@/components/lawyers/LawyerStatusBadge'

import {
  useDebouncedValue,
} from '@/hooks/useDebouncedValue'

import {
  getLawyers,
} from '@/services/lawyer.service'

import type {
  SortDirection,
} from '@/types/common'

import type {
  Lawyer,
  LawyerState,
} from '@/types/lawyer'

type SortField =
  | 'fullName'
  | 'state'
  | 'createdAt'

const STATE_FILTER_OPTIONS: {
  value:
    | LawyerState
    | 'ALL'

  label: string
}[] = [
  {
    value:
      'ALL',

    label:
      'همه وضعیت‌ها',
  },

  {
    value:
      'PENDING_VERIFICATION',

    label:
      'در انتظار احراز',
  },

  {
    value:
      'ACTIVE',

    label:
      'فعال',
  },

  {
    value:
      'SUSPENDED',

    label:
      'معلق',
  },

  {
    value:
      'REJECTED',

    label:
      'رد شده',
  },
]

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

export default function LawyersPage() {
  const [
    lawyers,
    setLawyers,
  ] =
    useState<Lawyer[]>(
      [],
    )

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

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
    searchQuery,
    setSearchQuery,
  ] =
    useState('')

  const debouncedSearch =
    useDebouncedValue(
      searchQuery,
    )

  const [
    stateFilter,
    setStateFilter,
  ] =
    useState<
      | LawyerState
      | 'ALL'
    >('ALL')

  const [
    sortField,
    setSortField,
  ] =
    useState<SortField>(
      'fullName',
    )

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      'asc',
    )

  const [
    createModalOpen,
    setCreateModalOpen,
  ] =
    useState(false)

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0)

  useEffect(() => {
    let active =
      true

    async function loadLawyers() {
      try {
        setIsLoading(
          true,
        )

        setError(
          null,
        )

        const data =
          await getLawyers({
            search:
              debouncedSearch.trim() ||
              undefined,

            state:
              stateFilter ===
              'ALL'
                ? undefined
                : stateFilter,

            sortBy:
              sortField,

            sortOrder:
              sortDirection,
          })

        if (active) {
          setLawyers(
            data,
          )
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت لیست وکلا',
          )
        }
      } finally {
        if (active) {
          setIsLoading(
            false,
          )
        }
      }
    }

    void loadLawyers()

    return () => {
      active = false
    }
  }, [
    debouncedSearch,
    stateFilter,
    sortField,
    sortDirection,
    refreshKey,
  ])

  function toggleSort(
    field: SortField,
  ) {
    if (
      sortField ===
      field
    ) {
      setSortDirection(
        (
          current,
        ) =>
          current ===
          'asc'
            ? 'desc'
            : 'asc',
      )

      return
    }

    setSortField(
      field,
    )

    setSortDirection(
      'asc',
    )
  }

  function handleLawyerCreated(
    lawyer: Lawyer,
  ) {
    setCreateModalOpen(
      false,
    )

    setError(null)

    setSuccess(
      `حساب ${lawyer.fullName} با موفقیت ساخته شد.`,
    )

    setSearchQuery(
      '',
    )

    setStateFilter(
      'ALL',
    )

    setSortField(
      'createdAt',
    )

    setSortDirection(
      'desc',
    )

    setRefreshKey(
      (
        current,
      ) =>
        current + 1,
    )
  }

  return (
    <>
      <div
        dir="rtl"
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-900">
              وکلا
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              مدیریت، افزودن،
              احراز و کنترل
              حساب‌های وکلا
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSuccess(
                null,
              )

              setError(
                null,
              )

              setCreateModalOpen(
                true,
              )
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus
              size={18}
            />

            افزودن وکیل
          </button>
        </div>

        {error && (
          <ErrorState
            message={
              error
            }
          />
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={
                searchQuery
              }
              onChange={(
                event,
              ) =>
                setSearchQuery(
                  event.target
                    .value,
                )
              }
              placeholder="جستجو بر اساس نام، شماره یا ایمیل..."
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={
              stateFilter
            }
            onChange={(
              event,
            ) =>
              setStateFilter(
                event.target
                  .value as
                  | LawyerState
                  | 'ALL',
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {STATE_FILTER_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {isLoading ? (
            <LoadingState />
          ) : lawyers.length ===
            0 ? (
            <EmptyState message="هیچ وکیلی با این شرایط پیدا نشد." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    {[
                      [
                        'fullName',
                        'نام و نام خانوادگی',
                      ],

                      [
                        'state',
                        'وضعیت وکیل',
                      ],

                      [
                        'createdAt',
                        'تاریخ ثبت‌نام',
                      ],
                    ].map(
                      ([
                        field,
                        label,
                      ]) => (
                        <th
                          key={
                            field
                          }
                          className="px-4 py-3 font-bold text-zinc-600"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleSort(
                                field as SortField,
                              )
                            }
                            className="flex items-center gap-1.5 hover:text-zinc-900"
                          >
                            {
                              label
                            }

                            <ArrowUpDown
                              size={
                                14
                              }
                            />
                          </button>
                        </th>
                      ),
                    )}

                    <th className="px-4 py-3 font-bold text-zinc-600">
                      شماره تماس
                    </th>

                    <th className="px-4 py-3 font-bold text-zinc-600">
                      تخصص
                    </th>

                    <th className="px-4 py-3 font-bold text-zinc-600">
                      وضعیت اکانت
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {lawyers.map(
                    (
                      lawyer,
                    ) => (
                      <tr
                        key={
                          lawyer.id
                        }
                        className="transition hover:bg-zinc-50"
                      >
                        <td className="px-4 py-3 font-semibold text-zinc-900">
                          {
                            lawyer.fullName
                          }

                          {lawyer.email && (
                            <div
                              dir="ltr"
                              className="mt-1 w-fit text-xs font-normal text-zinc-400"
                            >
                              {
                                lawyer.email
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <LawyerStatusBadge
                            state={
                              lawyer.state
                            }
                          />
                        </td>

                        <td className="px-4 py-3 text-zinc-500">
                          {formatDate(
                            lawyer.createdAt,
                          )}
                        </td>

                        <td
                          dir="ltr"
                          className="px-4 py-3 text-left text-zinc-600"
                        >
                          {lawyer.phone ||
                            '—'}
                        </td>

                        <td className="px-4 py-3 text-zinc-600">
                          {lawyer.specialization ||
                            '—'}
                        </td>

                        <td className="px-4 py-3">
                          <AccountStatusBadge
                            status={
                              lawyer.accountStatus
                            }
                          />
                        </td>

                        <td className="px-4 py-3">
                          <Link
                            href={`/lawyers/${lawyer.id}`}
                            className="rounded-lg px-2 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                          >
                            مدیریت
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateLawyerModal
        open={
          createModalOpen
        }
        onClose={() =>
          setCreateModalOpen(
            false,
          )
        }
        onCreated={
          handleLawyerCreated
        }
      />
    </>
  )
}