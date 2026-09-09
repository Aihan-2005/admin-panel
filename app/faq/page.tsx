'use client'

import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  CircleHelp,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  createFAQ,
  deleteFAQ,
  getFAQs,
} from '@/services/faq.service'

import type {
  FAQ,
  FAQPagination,
} from '@/types/faq'

const EMPTY_PAGINATION: FAQPagination =
  {
    page: 1,

    limit: 20,

    total: 0,

    totalPages: 1,
  }

export default function FAQPage() {
  const [
    items,
    setItems,
  ] =
    useState<FAQ[]>([])

  const [
    pagination,
    setPagination,
  ] =
    useState<FAQPagination>(
      EMPTY_PAGINATION,
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    page,
    setPage,
  ] = useState(1)

  const [
    question,
    setQuestion,
  ] = useState('')

  const [
    answer,
    setAnswer,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    creating,
    setCreating,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
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

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          let active = true

          setLoading(true)

          getFAQs({
            search:
              search.trim() ||
              undefined,

            page,

            limit: 20,
          })
            .then(
              (result) => {
                if (!active) {
                  return
                }

                setItems(
                  result.items,
                )

                setPagination(
                  result.pagination,
                )

                setError(
                  null,
                )
              },
            )
            .catch(
              (err) => {
                if (active) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'خطا در دریافت سوالات متداول',
                  )
                }
              },
            )
            .finally(
              () => {
                if (active) {
                  setLoading(
                    false,
                  )
                }
              },
            )

          return () => {
            active = false
          }
        },
        300,
      )

    return () => {
      window.clearTimeout(
        timeout,
      )
    }
  }, [
    page,
    search,
  ])

  async function refresh() {
    const result =
      await getFAQs({
        search:
          search.trim() ||
          undefined,

        page,

        limit: 20,
      })

    setItems(
      result.items,
    )

    setPagination(
      result.pagination,
    )
  }

  async function handleCreate(
    event: FormEvent,
  ) {
    event.preventDefault()

    const finalQuestion =
      question.trim()

    const finalAnswer =
      answer.trim()

    if (
      !finalQuestion ||
      !finalAnswer
    ) {
      return
    }

    try {
      setCreating(true)

      setError(null)
      setSuccess(null)

      await createFAQ(
        finalQuestion,
        finalAnswer,
      )

      setQuestion('')

      setAnswer('')

      setPage(1)

      await refresh()

      setSuccess(
        'سوال متداول با موفقیت اضافه شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'افزودن سوال ناموفق بود.',
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(
    item: FAQ,
  ) {
    if (
      !window.confirm(
        `سوال «${item.question}» حذف شود؟`,
      )
    ) {
      return
    }

    try {
      setDeletingId(
        item.id,
      )

      setError(null)
      setSuccess(null)

      await deleteFAQ(
        item.id,
      )

      await refresh()

      setSuccess(
        'سوال با موفقیت حذف شد.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'حذف سوال ناموفق بود.',
      )
    } finally {
      setDeletingId(
        null,
      )
    }
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <CircleHelp
            size={25}
            className="text-blue-600"
          />

          <h1 className="text-2xl font-black text-zinc-950">
            سوالات متداول
          </h1>
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          مدیریت سوالات و
          پاسخ‌هایی که در بخش FAQ
          سامانه نمایش داده می‌شوند.
        </p>
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus
            size={19}
            className="text-blue-600"
          />

          <h2 className="font-black">
            افزودن سوال جدید
          </h2>
        </div>

        <form
          onSubmit={
            handleCreate
          }
          className="mt-5 space-y-4"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-black text-zinc-600">
              سوال
            </span>

            <input
              value={
                question
              }
              onChange={(
                event,
              ) =>
                setQuestion(
                  event.target
                    .value,
                )
              }
              placeholder="مثلاً چگونه رمز عبور خود را تغییر دهم؟"
              className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black text-zinc-600">
              پاسخ
            </span>

            <textarea
              value={
                answer
              }
              onChange={(
                event,
              ) =>
                setAnswer(
                  event.target
                    .value,
                )
              }
              rows={5}
              placeholder="پاسخ کامل سوال..."
              className="w-full resize-y rounded-xl border border-zinc-300 p-3 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                creating ||
                !question.trim() ||
                !answer.trim()
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus
                size={16}
              />

              {creating
                ? 'در حال افزودن...'
                : 'افزودن سوال'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) => {
                setSearch(
                  event.target
                    .value,
                )

                setPage(1)
              }}
              placeholder="جستجو در سوال یا پاسخ..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="در حال دریافت سوالات..." />
        ) : items.length ===
          0 ? (
          <EmptyState message="سوالی پیدا نشد." />
        ) : (
          <div className="divide-y divide-zinc-100">
            {items.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-black leading-7 text-zinc-900">
                        {
                          item.question
                        }
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
                        {
                          item.answer
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          item,
                        )
                      }
                      disabled={
                        deletingId ===
                        item.id
                      }
                      className="shrink-0 rounded-xl p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2
                        size={
                          18
                        }
                      />
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}

        {pagination.totalPages >
          1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 p-4">
            <button
              type="button"
              disabled={
                page <= 1
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
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold disabled:opacity-40"
            >
              قبلی
            </button>

            <span className="text-xs font-bold text-zinc-500">
              صفحه{' '}
              {new Intl.NumberFormat(
                'fa-IR',
              ).format(
                pagination.page,
              )}{' '}
              از{' '}
              {new Intl.NumberFormat(
                'fa-IR',
              ).format(
                pagination.totalPages,
              )}
            </span>

            <button
              type="button"
              disabled={
                page >=
                pagination.totalPages
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
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        )}
      </section>
    </div>
  )
}