'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  UserRound,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  getTickets,
} from '@/services/ticket.service'

import {
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketStatus,
} from '@/types/ticket'

const TICKET_STATUSES =
  Object.keys(
    TICKET_STATUS_LABELS,
  ) as TicketStatus[]

const STATUS_STYLES: Record<
  TicketStatus,
  string
> = {
  OPEN:
    'border-blue-200 bg-blue-50 text-blue-700',

  IN_PROGRESS:
    'border-amber-200 bg-amber-50 text-amber-700',

  WAITING_FOR_LAWYER:
    'border-violet-200 bg-violet-50 text-violet-700',

  RESOLVED:
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
  ] = useState<
    Ticket[]
  >([])

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
    loading,
    setLoading,
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
          setTickets(
            data,
          )
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
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      return tickets
        .filter(
          (ticket) => {
            const matchesStatus =
              status ===
                'ALL' ||
              ticket.status ===
                status

            const matchesSearch =
              !query ||
              [
                ticket.id,
                ticket.subject,
                ticket.requesterName,
                ticket.requesterPhone,
                ticket.requesterEmail,
              ].some(
                (value) =>
                  value
                    ?.toLocaleLowerCase(
                      'fa-IR',
                    )
                    .includes(
                      query,
                    ),
              )

            return (
              matchesStatus &&
              matchesSearch
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
      search,
      status,
      tickets,
    ])

  const stats =
    useMemo(() => {
      return TICKET_STATUSES.reduce(
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

          WAITING_FOR_LAWYER:
            0,

          RESOLVED: 0,

          CLOSED: 0,
        } as Record<
          TicketStatus,
          number
        >,
      )
    }, [tickets])

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
          مدیریت درخواست‌های
          پشتیبانی، فایل‌ها و
          پاسخ‌گویی به وکلا
        </p>
      </div>

      {error && (
        <ErrorState
          message={
            error
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {TICKET_STATUSES.map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setStatus(
                  status ===
                    item
                    ? 'ALL'
                    : item,
                )
              }
              className={`rounded-2xl border bg-white p-4 text-right shadow-sm transition ${
                status ===
                item
                  ? 'border-blue-400 ring-2 ring-blue-100'
                  : 'border-zinc-200'
              }`}
            >
              <div className="text-xs font-bold text-zinc-500">
                {
                  TICKET_STATUS_LABELS[
                    item
                  ]
                }
              </div>

              <div className="mt-2 text-2xl font-black text-zinc-950">
                {new Intl.NumberFormat(
                  'fa-IR',
                ).format(
                  stats[
                    item
                  ],
                )}
              </div>
            </button>
          ),
        )}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
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
              placeholder="نام وکیل، شماره، ایمیل، عنوان یا شناسه تیکت..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none"
          >
            <option value="ALL">
              همه وضعیت‌ها
            </option>

            {TICKET_STATUSES.map(
              (item) => (
                <option
                  key={item}
                  value={item}
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
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {loading ? (
          <LoadingState label="در حال دریافت تیکت‌ها..." />
        ) : filtered.length ===
          0 ? (
          <EmptyState message="تیکتی پیدا نشد." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-right text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3">
                    تیکت
                  </th>

                  <th className="px-4 py-3">
                    درخواست‌دهنده
                  </th>

                  <th className="px-4 py-3">
                    تماس
                  </th>

                  <th className="px-4 py-3">
                    وضعیت
                  </th>

                  <th className="px-4 py-3">
                    پیام
                  </th>

                  <th className="px-4 py-3">
                    بروزرسانی
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {filtered.map(
                  (ticket) => (
                    <tr
                      key={
                        ticket.id
                      }
                      className="hover:bg-zinc-50"
                    >
                      <td className="px-4 py-4">
                        <div className="max-w-[260px] truncate font-black">
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

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound
                            size={
                              17
                            }
                            className="text-zinc-400"
                          />

                          <div>
                            <div className="font-bold">
                              {ticket.requesterName ||
                                'وکیل'}
                            </div>

                            <div className="mt-1 text-xs text-zinc-400">
                              وکیل
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          {ticket.requesterPhone && (
                            <div
                              dir="ltr"
                              className="flex w-fit items-center gap-1"
                            >
                              <Phone
                                size={
                                  13
                                }
                              />

                              {
                                ticket.requesterPhone
                              }
                            </div>
                          )}

                          {ticket.requesterEmail && (
                            <div
                              dir="ltr"
                              className="flex w-fit items-center gap-1"
                            >
                              <Mail
                                size={
                                  13
                                }
                              />

                              {
                                ticket.requesterEmail
                              }
                            </div>
                          )}

                          {!ticket.requesterPhone &&
                            !ticket.requesterEmail && (
                              <span className="text-zinc-400">
                                —
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
                            STATUS_STYLES[
                              ticket
                                .status
                            ]
                          }`}
                        >
                          {
                            TICKET_STATUS_LABELS[
                              ticket
                                .status
                            ]
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <MessageSquareText
                            size={
                              16
                            }
                          />

                          {new Intl.NumberFormat(
                            'fa-IR',
                          ).format(
                            ticket.messageCount ??
                              0,
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-zinc-500">
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

                      <td className="px-4 py-4">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100"
                        >
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}