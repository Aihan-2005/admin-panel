'use client'

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useParams,
} from 'next/navigation'

import type { LucideIcon } from 'lucide-react'

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  MessageSquareText,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  getTicket,
  replyToTicket,
  updateTicketStatus,
} from '@/services/ticket.service'

import {
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketMessage,
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

  const date = new Date(value)

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

function requesterTypeLabel(
  type?: string | null,
) {
  if (type === 'LAWYER') {
    return 'وکیل'
  }

  if (type === 'CLIENT') {
    return 'موکل'
  }

  if (type === 'ADMIN') {
    return 'ادمین'
  }

  return type || 'نامشخص'
}

function senderLabel(
  message: TicketMessage,
) {
  if (message.senderName) {
    return message.senderName
  }

  if (
    message.senderType ===
    'ADMIN'
  ) {
    return 'ادمین'
  }

  if (
    message.senderType ===
    'LAWYER'
  ) {
    return 'وکیل'
  }

  if (
    message.senderType ===
    'CLIENT'
  ) {
    return 'موکل'
  }

  return 'کاربر'
}

export default function TicketDetailsPage() {
  const { id } =
    useParams<{
      id: string
    }>()

  const [
    ticket,
    setTicket,
  ] =
    useState<Ticket | null>(
      null,
    )

  const [
    reply,
    setReply,
  ] = useState('')

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<TicketStatus>(
      'OPEN',
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    isReplying,
    setIsReplying,
  ] = useState(false)

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
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

  const [
    copied,
    setCopied,
  ] = useState(false)

  const loadTicket =
    useCallback(
      async (
        showRefreshState =
          false,
      ) => {
        try {
          if (
            showRefreshState
          ) {
            setIsRefreshing(
              true,
            )
          }

          setError(null)

          const data =
            await getTicket(
              id,
            )

          setTicket(data)

          setSelectedStatus(
            data.status,
          )
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت تیکت',
          )
        } finally {
          setIsLoading(false)

          setIsRefreshing(
            false,
          )
        }
      },
      [id],
    )

  useEffect(() => {
    void loadTicket()
  }, [loadTicket])

  const messages =
    useMemo(() => {
      return [
        ...(ticket?.messages ??
          []),
      ].sort(
        (a, b) =>
          new Date(
            a.createdAt,
          ).getTime() -
          new Date(
            b.createdAt,
          ).getTime(),
      )
    }, [ticket?.messages])

  async function handleStatusUpdate() {
    if (
      !ticket ||
      selectedStatus ===
        ticket.status
    ) {
      return
    }

    try {
      setIsUpdatingStatus(
        true,
      )

      setError(null)
      setSuccess(null)

      const updated =
        await updateTicketStatus(
          ticket.id,
          selectedStatus,
        )

      setTicket(updated)

      setSelectedStatus(
        updated.status,
      )

      setSuccess(
        'وضعیت تیکت با موفقیت تغییر کرد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت تیکت ناموفق بود.',
      )
    } finally {
      setIsUpdatingStatus(
        false,
      )
    }
  }

  async function handleReply(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const body =
      reply.trim()

    if (
      !ticket ||
      !body
    ) {
      return
    }

    try {
      setIsReplying(true)

      setError(null)
      setSuccess(null)

      const updated =
        await replyToTicket(
          ticket.id,
          body,
        )

      setTicket(updated)

      setSelectedStatus(
        updated.status,
      )

      setReply('')

      setSuccess(
        'پاسخ با موفقیت برای کاربر ارسال شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ارسال پاسخ ناموفق بود.',
      )
    } finally {
      setIsReplying(false)
    }
  }

  async function copyTicketId() {
    if (!ticket) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        ticket.id,
      )

      setCopied(true)

      window.setTimeout(
        () =>
          setCopied(false),
        1500,
      )
    } catch {
      setCopied(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState label="در حال دریافت تیکت..." />
    )
  }

  if (!ticket) {
    return (
      <ErrorState
        message={
          error ??
          'تیکت پیدا نشد.'
        }
      />
    )
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/tickets"
            className="mb-3 inline-flex items-center gap-1 text-sm font-black text-blue-700 transition hover:text-blue-900"
          >
            <ArrowRight
              size={16}
            />
            بازگشت به تیکت‌ها
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="max-w-3xl text-2xl font-black leading-9 text-zinc-950">
              {
                ticket.subject
              }
            </h1>

            <TicketStatusBadge
              status={
                ticket.status
              }
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span>
              شناسه تیکت:
            </span>

            <span
              dir="ltr"
              className="font-bold text-zinc-600"
            >
              {ticket.id}
            </span>

            <button
              type="button"
              onClick={
                copyTicketId
              }
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              {copied ? (
                <CheckCircle2
                  size={14}
                />
              ) : (
                <Copy
                  size={14}
                />
              )}

              {copied
                ? 'کپی شد'
                : 'کپی'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadTicket(
              true,
            )
          }
          disabled={
            isRefreshing
          }
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCcw
            size={15}
            className={
              isRefreshing
                ? 'animate-spin'
                : ''
            }
          />
          بروزرسانی
        </button>
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
          <CheckCircle2
            size={18}
          />

          {success}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaCard
          icon={UserRound}
          label="درخواست‌دهنده"
          value={
            ticket.requesterName ||
            'نامشخص'
          }
          secondary={requesterTypeLabel(
            ticket.requesterType,
          )}
        />

        <MetaCard
          icon={
            MessageSquareText
          }
          label="تعداد پیام‌ها"
          value={new Intl.NumberFormat(
            'fa-IR',
          ).format(
            messages.length,
          )}
          secondary="پیام ثبت‌شده"
        />

        <MetaCard
          icon={Clock3}
          label="تاریخ ایجاد"
          value={formatDate(
            ticket.createdAt,
          )}
        />

        <MetaCard
          icon={RefreshCcw}
          label="آخرین بروزرسانی"
          value={formatDate(
            ticket.updatedAt ??
              ticket.createdAt,
          )}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-100">
            <div className="flex items-center gap-2">
              <MessageSquareText
                size={19}
                className="text-blue-700"
              />

              <h2 className="font-black text-zinc-950">
                متن اولیه تیکت
              </h2>
            </div>

            <div className="mt-4 min-h-20 whitespace-pre-wrap rounded-2xl bg-zinc-50 p-4 text-sm leading-8 text-zinc-700">
              {ticket.description ||
                'برای این تیکت توضیح اولیه‌ای ثبت نشده است.'}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-zinc-950">
                گفتگو
              </h2>

              <span className="text-xs font-bold text-zinc-400">
                {new Intl.NumberFormat(
                  'fa-IR',
                ).format(
                  messages.length,
                )}{' '}
                پیام
              </span>
            </div>

            {messages.length >
            0 ? (
              <div className="space-y-3">
                {messages.map(
                  (message) => (
                    <MessageBubble
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-400">
                هنوز پیامی برای
                این تیکت ثبت
                نشده است.
              </div>
            )}
          </section>

          <form
            onSubmit={
              handleReply
            }
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-100"
          >
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="ticket-reply"
                className="font-black text-zinc-950"
              >
                پاسخ ادمین
              </label>

              <span className="text-xs font-bold text-zinc-400">
                {new Intl.NumberFormat(
                  'fa-IR',
                ).format(
                  reply.length,
                )}{' '}
                کاراکتر
              </span>
            </div>

            <textarea
              id="ticket-reply"
              value={reply}
              onChange={(
                event,
              ) =>
                setReply(
                  event.target
                    .value,
                )
              }
              rows={6}
              maxLength={4000}
              placeholder="پاسخ دقیق و کامل را برای کاربر بنویسید..."
              className="mt-3 w-full resize-y rounded-2xl border border-zinc-300 p-4 text-sm leading-8 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-zinc-400">
                پاسخ بعد از ارسال
                به تاریخچه همین
                تیکت اضافه می‌شود.
              </p>

              <button
                type="submit"
                disabled={
                  isReplying ||
                  !reply.trim() ||
                  ticket.status ===
                    'CLOSED'
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send
                  size={16}
                />

                {isReplying
                  ? 'در حال ارسال...'
                  : 'ارسال پاسخ'}
              </button>
            </div>

            {ticket.status ===
              'CLOSED' && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
                این تیکت بسته
                است. برای ارسال
                پاسخ ابتدا وضعیت
                آن را از پنل
                مدیریت وضعیت
                تغییر دهید.
              </div>
            )}
          </form>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-100">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className="text-zinc-700"
              />

              <h2 className="font-black text-zinc-950">
                مدیریت وضعیت
              </h2>
            </div>

            <p className="mt-2 text-xs leading-6 text-zinc-500">
              وضعیت پشتیبانی
              این تیکت را مستقل
              از متن پاسخ مدیریت
              کنید.
            </p>

            <select
              value={
                selectedStatus
              }
              onChange={(
                event,
              ) =>
                setSelectedStatus(
                  event.target
                    .value as TicketStatus,
                )
              }
              className="mt-4 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {TICKET_STATUSES.map(
                (status) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {
                      TICKET_STATUS_LABELS[
                        status
                      ]
                    }
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={
                handleStatusUpdate
              }
              disabled={
                isUpdatingStatus ||
                selectedStatus ===
                  ticket.status
              }
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                size={16}
              />

              {isUpdatingStatus
                ? 'در حال ذخیره...'
                : 'ذخیره وضعیت'}
            </button>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-100">
            <h2 className="font-black text-zinc-950">
              اطلاعات تیکت
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow
                label="نام درخواست‌دهنده"
                value={
                  ticket.requesterName ||
                  'نامشخص'
                }
              />

              <InfoRow
                label="نوع درخواست‌دهنده"
                value={requesterTypeLabel(
                  ticket.requesterType,
                )}
              />

              <InfoRow
                label="تاریخ ایجاد"
                value={formatDate(
                  ticket.createdAt,
                )}
              />

              <InfoRow
                label="آخرین تغییر"
                value={formatDate(
                  ticket.updatedAt ??
                    ticket.createdAt,
                )}
              />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

function TicketStatusBadge({
  status,
}: {
  status: TicketStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${STATUS_STYLES[status]}`}
    >
      {
        TICKET_STATUS_LABELS[
          status
        ]
      }
    </span>
  )
}

function MetaCard({
  icon: Icon,
  label,
  value,
  secondary,
}: {
  icon: LucideIcon
  label: string
  value: string
  secondary?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-100">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-black text-zinc-900">
            {value}
          </p>

          {secondary && (
            <p className="mt-0.5 text-xs text-zinc-400">
              {secondary}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
}: {
  message: TicketMessage
}) {
  const isAdmin =
    message.senderType ===
    'ADMIN'

  return (
    <article
      className={`max-w-3xl rounded-2xl border p-4 shadow-sm ${
        isAdmin
          ? 'mr-auto border-blue-200 bg-blue-50/70 shadow-blue-100/50'
          : 'ml-auto border-zinc-200 bg-white shadow-zinc-100'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck
                size={14}
              />
            ) : (
              <UserRound
                size={14}
              />
            )}
          </span>

          <span className="font-black text-zinc-700">
            {senderLabel(
              message,
            )}
          </span>
        </div>

        <time className="text-zinc-400">
          {formatDate(
            message.createdAt,
          )}
        </time>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-zinc-800">
        {message.body}
      </p>
    </article>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-zinc-500">
        {label}
      </dt>

      <dd className="text-left font-black text-zinc-800">
        {value}
      </dd>
    </div>
  )
}