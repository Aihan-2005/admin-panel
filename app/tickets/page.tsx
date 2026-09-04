'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquareText,
  Search,
  UserRound,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import { getTickets } from '@/services/ticket.service'

import {
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketStatus,
} from '@/types/ticket'

const TICKET_STATUSES =
  Object.keys(
    TICKET_STATUS_LABELS,
  ) as TicketStatus[]

const PAGE_SIZE = 10

const STATUS_STYLES: Record<
  TicketStatus,
  string
> = {
  OPEN:
    'border-blue-200 bg-blue-50 text-blue-700',

  IN_PROGRESS:
    'border-amber-200 bg-amber-50 text-amber-700',

  ANSWERED:
    'border-emerald-200 bg-emerald-50 text-emerald-700',

  CLOSED:
    'border-zinc-200 bg-zinc-100 text-zinc-600',
}

function formatDate(
  value?: string | null,
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

  return date.toLocaleString(
    'fa-IR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  )
}

export default function TicketsPage() {
  const [
    tickets,
    setTickets,
  ] =
    useState<Ticket[]>(
      [],
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    status,
    setStatus,
  ] = useState<
    TicketStatus | 'ALL'
  >('ALL')

  const [
    requesterType,
    setRequesterType,
  ] = useState<
    | 'ALL'
    | 'LAWYER'
    | 'CLIENT'
  >('ALL')

  const [
    page,
    setPage,
  ] = useState(1)

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

    getTickets()
      .then((data) => {
        if (active) {
          setTickets(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت تیکت‌ها',
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

  const stats =
    useMemo(() => {
      return TICKET_STATUSES.reduce<
        Record<
          TicketStatus,
          number
        >
      >(
        (
          result,
          item,
        ) => {
          result[item] =
            tickets.filter(
              (ticket) =>
                ticket.status ===
                item,
            ).length

          return result
        },
        {
          OPEN: 0,
          IN_PROGRESS: 0,
          ANSWERED: 0,
          CLOSED: 0,
        },
      )
    }, [tickets])

  const filteredTickets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      return [...tickets]
        .filter(
          (ticket) => {
            const matchesSearch =
              !query ||
              [
                ticket.id,
                ticket.subject,
                ticket.requesterName,
                ticket.description,
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
              status ===
                'ALL' ||
              ticket.status ===
                status

            const matchesRequester =
              requesterType ===
                'ALL' ||
              ticket.requesterType ===
                requesterType

            return Boolean(
              matchesSearch &&
                matchesStatus &&
                matchesRequester,
            )
          },
        )
        .sort(
          (a, b) =>
            new Date(
              b.updatedAt ??
                b.createdAt,
            ).getTime() -
            new Date(
              a.updatedAt ??
                a.createdAt,
            ).getTime(),
        )
    }, [
      requesterType,
      search,
      status,
      tickets,
    ])

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredTickets.length /
          PAGE_SIZE,
      ),
    )

  const currentPage =
    Math.min(
      page,
      totalPages,
    )

  const paginatedTickets =
    filteredTickets.slice(
      (currentPage - 1) *
        PAGE_SIZE,

      currentPage *
        PAGE_SIZE,
    )

  useEffect(() => {
    setPage(1)
  }, [
    search,
    status,
    requesterType,
  ])

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-black text-zinc-950">
          تیکت‌ها
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          مشاهده، فیلتر،
          پاسخ‌گویی و تغییر وضعیت
          تیکت‌های پشتیبانی
        </p>
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TICKET_STATUSES.map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setStatus(item)
              }
              className={`rounded-2xl border bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                status === item
                  ? 'border-blue-300 ring-2 ring-blue-100'
                  : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-zinc-500">
                    {
                      TICKET_STATUS_LABELS[
                        item
                      ]
                    }
                  </p>

                  <p className="mt-2 text-2xl font-black text-zinc-950">
                    {new Intl.NumberFormat(
                      'fa-IR',
                    ).format(
                      stats[
                        item
                      ],
                    )}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-black ${STATUS_STYLES[item]}`}
                >
                  {
                    TICKET_STATUS_LABELS[
                      item
                    ]
                  }
                </span>
              </div>
            </button>
          ),
        )}
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
              placeholder="جستجو در عنوان، نام درخواست‌دهنده، توضیحات یا شناسه..."
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(
              event,
            ) =>
              setStatus(
                event.target
                  .value as
                  | TicketStatus
                  | 'ALL',
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه وضعیت‌ها
            </option>

            {TICKET_STATUSES.map(
              (item) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {
                    TICKET_STATUS_LABELS[
                      item
                    ]
                  }
                </option>
              ),
            )}
          </select>

          <select
            value={
              requesterType
            }
            onChange={(
              event,
            ) =>
              setRequesterType(
                event.target
                  .value as
                  | 'ALL'
                  | 'LAWYER'
                  | 'CLIENT',
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه کاربران
            </option>

            <option value="LAWYER">
              وکلا
            </option>

            <option value="CLIENT">
              موکلین
            </option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100">
        {isLoading ? (
          <LoadingState label="در حال دریافت تیکت‌ها..." />
        ) : paginatedTickets.length ===
          0 ? (
          <EmptyState message="تیکتی با این شرایط پیدا نشد." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-right text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80">
                  <tr>
                    <th className="px-4 py-3 font-black text-zinc-600">
                      تیکت
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      درخواست‌دهنده
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      وضعیت
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      پیام‌ها
                    </th>

                    <th className="px-4 py-3 font-black text-zinc-600">
                      آخرین تغییر
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {paginatedTickets.map(
                    (ticket) => (
                      <tr
                        key={
                          ticket.id
                        }
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3.5">
                          <div className="max-w-[320px] truncate font-black text-zinc-900">
                            {
                              ticket.subject
                            }
                          </div>

                          <div
                            dir="ltr"
                            className="mt-1 w-fit text-xs text-zinc-400"
                          >
                            {
                              ticket.id
                            }
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <UserRound
                              size={
                                16
                              }
                              className="text-zinc-400"
                            />

                            <div>
                              <div className="font-bold text-zinc-800">
                                {ticket.requesterName ||
                                  'نامشخص'}
                              </div>

                              <div className="mt-0.5 text-xs text-zinc-400">
                                {ticket.requesterType ===
                                'LAWYER'
                                  ? 'وکیل'
                                  : ticket.requesterType ===
                                      'CLIENT'
                                    ? 'موکل'
                                    : ticket.requesterType ||
                                      'نامشخص'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${STATUS_STYLES[ticket.status]}`}
                          >
                            {
                              TICKET_STATUS_LABELS[
                                ticket
                                  .status
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="inline-flex items-center gap-1.5 text-zinc-600">
                            <MessageSquareText
                              size={
                                16
                              }
                            />

                            {new Intl.NumberFormat(
                              'fa-IR',
                            ).format(
                              ticket
                                .messages
                                ?.length ??
                                0,
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Clock3
                              size={
                                15
                              }
                            />

                            {formatDate(
                              ticket.updatedAt ??
                                ticket.createdAt,
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="rounded-lg px-2.5 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"
                          >
                            باز کردن
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {totalPages >
              1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
                <span className="text-xs font-bold text-zinc-500">
                  صفحه{' '}
                  {new Intl.NumberFormat(
                    'fa-IR',
                  ).format(
                    currentPage,
                  )}{' '}
                  از{' '}
                  {new Intl.NumberFormat(
                    'fa-IR',
                  ).format(
                    totalPages,
                  )}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      currentPage <=
                      1
                    }
                    onClick={() =>
                      setPage(
                        (
                          current,
                        ) =>
                          current -
                          1,
                      )
                    }
                    className="rounded-lg border border-zinc-200 p-2 text-zinc-600 disabled:opacity-40"
                    aria-label="صفحه قبلی"
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={
                      currentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        (
                          current,
                        ) =>
                          current +
                          1,
                      )
                    }
                    className="rounded-lg border border-zinc-200 p-2 text-zinc-600 disabled:opacity-40"
                    aria-label="صفحه بعدی"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}