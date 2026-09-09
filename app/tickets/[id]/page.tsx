'use client'

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  Download,
  FileText,
  Mail,
  Paperclip,
  Phone,
  RefreshCcw,
  Save,
  Send,
  UserRound,
  X,
} from 'lucide-react'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  getTicket,
  getTicketAttachmentUrl,
  replyToTicket,
  updateTicketStatus,
} from '@/services/ticket.service'

import {
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  type Ticket,
  type TicketMessage,
  type TicketStatus,
} from '@/types/ticket'

const MAX_FILE_SIZE =
  2 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  'jpg',
  'png',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'zip',
  'rar',
]

const TICKET_STATUSES =
  Object.keys(
    TICKET_STATUS_LABELS,
  ) as TicketStatus[]

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—'
  }

  return new Date(
    value,
  ).toLocaleString(
    'fa-IR',
    {
      dateStyle: 'medium',

      timeStyle: 'short',
    },
  )
}

function fileExtension(
  file: File,
) {
  return (
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ??
    ''
  )
}

export default function TicketDetailsPage() {
  const ticketId =
    typeof window !==
    'undefined'
      ? window.location.pathname
          .split('/')
          .filter(Boolean)
          .pop() ?? ''
      : ''

  const [
    ticket,
    setTicket,
  ] =
    useState<Ticket | null>(
      null,
    )

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<TicketStatus>(
      'OPEN',
    )

  const [
    reply,
    setReply,
  ] = useState('')

  const [
    attachment,
    setAttachment,
  ] =
    useState<File | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

  const [
    replying,
    setReplying,
  ] = useState(false)

  const [
    savingStatus,
    setSavingStatus,
  ] = useState(false)

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<string | null>(
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

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const loadTicket =
    useCallback(
      async (
        refresh = false,
      ) => {
        if (!ticketId) {
          return
        }

        try {
          if (refresh) {
            setRefreshing(
              true,
            )
          }

          setError(null)

          const data =
            await getTicket(
              ticketId,
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
          setLoading(false)

          setRefreshing(
            false,
          )
        }
      },
      [ticketId],
    )

  useEffect(() => {
    void loadTicket()
  }, [loadTicket])

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    setError(null)

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        'حداکثر حجم فایل ۲ مگابایت است.',
      )

      event.target.value =
        ''

      return
    }

    if (
      !ALLOWED_EXTENSIONS.includes(
        fileExtension(
          file,
        ),
      )
    ) {
      setError(
        'فرمت فایل مجاز نیست.',
      )

      event.target.value =
        ''

      return
    }

    setAttachment(file)
  }

  function removeAttachment() {
    setAttachment(null)

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ''
    }
  }

  async function handleReply(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (
      !ticket ||
      !reply.trim()
    ) {
      return
    }

    try {
      setReplying(true)

      setError(null)
      setSuccess(null)

      const updated =
        await replyToTicket(
          ticket.id,
          reply,
          attachment,
        )

      setTicket(updated)

      setReply('')

      removeAttachment()

      setSuccess(
        'پاسخ با موفقیت ارسال شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ارسال پاسخ ناموفق بود.',
      )
    } finally {
      setReplying(false)
    }
  }

  async function saveStatus() {
    if (
      !ticket ||
      selectedStatus ===
        ticket.status
    ) {
      return
    }

    try {
      setSavingStatus(
        true,
      )

      setError(null)

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
        'وضعیت تیکت بروزرسانی شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت ناموفق بود.',
      )
    } finally {
      setSavingStatus(
        false,
      )
    }
  }

  async function openAttachment(
    message: TicketMessage,
  ) {
    if (
      !ticket ||
      !message.attachmentId
    ) {
      return
    }

    try {
      setDownloadingId(
        message.id,
      )

      setError(null)

      const url =
        await getTicketAttachmentUrl(
          ticket.id,
          message.id,
        )

      const anchor =
        document.createElement(
          'a',
        )

      anchor.href = url

      anchor.target =
        '_blank'

      anchor.rel =
        'noopener noreferrer'

      anchor.click()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'دریافت فایل ناموفق بود.',
      )
    } finally {
      setDownloadingId(
        null,
      )
    }
  }

  if (loading) {
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

  const messages =
    [
      ...(ticket.messages ??
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

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/tickets"
            className="mb-3 inline-flex items-center gap-1 text-sm font-black text-blue-700"
          >
            <ArrowRight
              size={16}
            />

            بازگشت به تیکت‌ها
          </Link>

          <h1 className="text-2xl font-black text-zinc-950">
            {
              ticket.subject
            }
          </h1>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span>
              {
                TICKET_STATUS_LABELS[
                  ticket.status
                ]
              }
            </span>

            {ticket.type && (
              <>
                <span>
                  •
                </span>

                <span>
                  {
                    TICKET_TYPE_LABELS[
                      ticket.type
                    ]
                  }
                </span>
              </>
            )}

            <span>
              •
            </span>

            <span>
              {formatDate(
                ticket.createdAt,
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() =>
            void loadTicket(
              true,
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold"
        >
          <RefreshCcw
            size={16}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          بروزرسانی
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

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="درخواست‌دهنده"
          icon={
            <UserRound
              size={18}
            />
          }
        >
          <div className="font-black">
            {ticket.requesterName ||
              'وکیل'}
          </div>
        </InfoCard>

        <InfoCard
          title="شماره تماس"
          icon={
            <Phone
              size={18}
            />
          }
        >
          <div dir="ltr">
            {ticket.requesterPhone ||
              '—'}
          </div>
        </InfoCard>

        <InfoCard
          title="ایمیل"
          icon={
            <Mail
              size={18}
            />
          }
        >
          <div
            dir="ltr"
            className="break-all"
          >
            {ticket.requesterEmail ||
              '—'}
          </div>
        </InfoCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-black">
              گفتگو
            </h2>

            <div className="mt-5 space-y-3">
              {messages.map(
                (message) => (
                  <div
                    key={
                      message.id
                    }
                    className={`rounded-2xl border p-4 ${
                      message.senderType ===
                      'ADMIN'
                        ? 'mr-auto border-blue-200 bg-blue-50'
                        : 'ml-auto border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-black text-zinc-700">
                        {message.senderName ||
                          (message.senderType ===
                          'ADMIN'
                            ? 'ادمین'
                            : ticket.requesterName)}
                      </span>

                      <span className="text-xs text-zinc-400">
                        {formatDate(
                          message.createdAt,
                        )}
                      </span>
                    </div>

                    <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-800">
                      {
                        message.body
                      }
                    </div>

                    {message.attachmentId && (
                      <button
                        type="button"
                        disabled={
                          downloadingId ===
                          message.id
                        }
                        onClick={() =>
                          void openAttachment(
                            message,
                          )
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        <Download
                          size={
                            15
                          }
                        />

                        {downloadingId ===
                        message.id
                          ? 'در حال دریافت...'
                          : 'مشاهده / دانلود فایل'}
                      </button>
                    )}
                  </div>
                ),
              )}

              {messages.length ===
                0 && (
                <div className="py-8 text-center text-sm text-zinc-400">
                  پیامی وجود ندارد.
                </div>
              )}
            </div>
          </section>

          <form
            onSubmit={
              handleReply
            }
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <h2 className="font-black">
              ارسال پاسخ
            </h2>

            <textarea
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
              maxLength={5000}
              disabled={
                ticket.status ===
                'CLOSED'
              }
              placeholder="متن پاسخ ادمین..."
              className="mt-4 w-full resize-y rounded-xl border border-zinc-300 p-4 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100"
            />

            <div className="mt-4">
              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={
                  handleFileChange
                }
                disabled={
                  ticket.status ===
                  'CLOSED'
                }
                className="hidden"
                id="ticket-attachment"
              />

              {!attachment ? (
                <label
                  htmlFor="ticket-attachment"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  <Paperclip
                    size={17}
                  />

                  افزودن فایل
                </label>
              ) : (
                <div className="flex max-w-lg items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText
                      size={18}
                      className="shrink-0 text-blue-600"
                    />

                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">
                        {
                          attachment.name
                        }
                      </div>

                      <div className="text-xs text-zinc-400">
                        {(
                          attachment.size /
                          1024
                        ).toFixed(
                          0,
                        )}{' '}
                        KB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeAttachment
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <X
                      size={16}
                    />
                  </button>
                </div>
              )}

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                حداکثر ۲ مگابایت؛
                JPG، PNG، PDF،
                DOC، DOCX، XLS،
                XLSX، ZIP و RAR
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={
                  replying ||
                  !reply.trim() ||
                  ticket.status ===
                    'CLOSED'
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send
                  size={17}
                />

                {replying
                  ? 'در حال ارسال...'
                  : 'ارسال پاسخ'}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-black">
              مدیریت وضعیت
            </h2>

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
              className="mt-4 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm"
            >
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

            <button
              type="button"
              onClick={() =>
                void saveStatus()
              }
              disabled={
                savingStatus ||
                selectedStatus ===
                  ticket.status
              }
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-black text-white disabled:opacity-50"
            >
              <Save
                size={16}
              />

              ذخیره وضعیت
            </button>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-black">
              اطلاعات تیکت
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <Row
                label="شناسه"
                value={
                  ticket.id
                }
                ltr
              />

              <Row
                label="تعداد پیام"
                value={String(
                  messages.length,
                )}
              />

              <Row
                label="تاریخ ایجاد"
                value={formatDate(
                  ticket.createdAt,
                )}
              />

              <Row
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

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string

  icon: React.ReactNode

  children:
    React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        {icon}

        {title}
      </div>

      <div className="mt-3 text-sm font-bold text-zinc-900">
        {children}
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  ltr = false,
}: {
  label: string

  value: string

  ltr?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 last:border-0">
      <dt className="text-zinc-500">
        {label}
      </dt>

      <dd
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="break-all text-left font-bold"
      >
        {value}
      </dd>
    </div>
  )
}