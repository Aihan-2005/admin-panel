'use client'

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Check,
  Loader2,
  Search,
  Star,
  UserPlus,
  X,
} from 'lucide-react'

import type {
  Lawyer,
} from '@/types/lawyer'

import type {
  AddClientLawyerPayload,
} from '@/types/client-lawyer'

interface AddClientLawyerModalProps {
  open: boolean

  lawyers: Lawyer[]

  nextOrder: number

  onClose: () => void

  onAdd: (
    payload: AddClientLawyerPayload,
  ) => Promise<void>
}

export function AddClientLawyerModal({
  open,
  lawyers,
  nextOrder,
  onClose,
  onAdd,
}: AddClientLawyerModalProps) {
  const [
    search,
    setSearch,
  ] = useState('')

  const [
    selectedId,
    setSelectedId,
  ] = useState('')

  const [
    featured,
    setFeatured,
  ] = useState(false)

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState(
    nextOrder,
  )

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    if (!open) {
      return
    }

    setSearch('')
    setSelectedId('')
    setFeatured(false)
    setDisplayOrder(
      nextOrder,
    )
    setError(null)
  }, [
    nextOrder,
    open,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    const previous =
      document.body.style
        .overflow

    document.body.style.overflow =
      'hidden'

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          'Escape' &&
        !submitting
      ) {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previous

      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [
    onClose,
    open,
    submitting,
  ])

  const filteredLawyers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      if (!query) {
        return lawyers
      }

      return lawyers.filter(
        (lawyer) =>
          [
            lawyer.fullName,
            lawyer.phone,
            lawyer.email,
            lawyer.specialization,
            lawyer.licenseNumber,
          ].some(
            (value) =>
              value
                ?.toLocaleLowerCase(
                  'fa-IR',
                )
                .includes(
                  query,
                ),
          ),
      )
    }, [
      lawyers,
      search,
    ])

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (!selectedId) {
      setError(
        'ابتدا یک وکیل را انتخاب کنید.',
      )

      return
    }

    try {
      setSubmitting(
        true,
      )

      setError(null)

      await onAdd({
        lawyerId:
          selectedId,

        isFeatured:
          featured,

        displayOrder:
          Math.max(
            1,
            displayOrder,
          ),
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'افزودن وکیل ناموفق بود.',
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={
          submitting
            ? undefined
            : onClose
        }
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
      />

      <form
        onSubmit={
          submit
        }
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserPlus
                size={21}
              />
            </div>

            <div>
              <h2 className="font-black text-zinc-950">
                افزودن وکیل به بخش
                موکلین
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                انتخاب از بین وکلای
                فعال سامانه
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              submitting
            }
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

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
              placeholder="جستجوی نام، موبایل، ایمیل، تخصص یا شماره پروانه..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-black text-zinc-600">
              انتخاب وکیل
            </p>

            {filteredLawyers.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                وکیل فعالی برای افزودن
                پیدا نشد.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredLawyers.map(
                  (lawyer) => {
                    const selected =
                      selectedId ===
                      lawyer.id

                    return (
                      <button
                        key={
                          lawyer.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            lawyer.id,
                          )
                        }
                        className={`relative rounded-2xl border p-4 text-right transition ${
                          selected
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                            : 'border-zinc-200 hover:border-blue-200 hover:bg-zinc-50'
                        }`}
                      >
                        {selected && (
                          <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check
                              size={
                                14
                              }
                            />
                          </span>
                        )}

                        <p className="font-black text-zinc-900">
                          {
                            lawyer.fullName
                          }
                        </p>

                        <div className="mt-3 space-y-1 text-xs text-zinc-500">
                          <p>
                            تخصص:{' '}
                            {lawyer.specialization ||
                              '—'}
                          </p>

                          <p
                            dir="ltr"
                            className="w-fit"
                          >
                            {lawyer.phone ||
                              lawyer.email ||
                              '—'}
                          </p>

                          <p>
                            شماره پروانه:{' '}
                            {lawyer.licenseNumber ||
                              '—'}
                          </p>
                        </div>
                      </button>
                    )
                  },
                )}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-black text-zinc-600">
                ترتیب نمایش
              </span>

              <input
                type="number"
                min={1}
                value={
                  displayOrder
                }
                onChange={(
                  event,
                ) =>
                  setDisplayOrder(
                    Math.max(
                      1,
                      Number(
                        event
                          .target
                          .value,
                      ) ||
                        1,
                    ),
                  )
                }
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input
                type="checkbox"
                checked={
                  featured
                }
                onChange={(
                  event,
                ) =>
                  setFeatured(
                    event.target
                      .checked,
                  )
                }
                className="h-4 w-4 accent-blue-600"
              />

              <Star
                size={18}
                className={
                  featured
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-400'
                }
              />

              <div>
                <p className="text-sm font-black text-zinc-800">
                  وکیل ویژه
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  نمایش برجسته‌تر در
                  بخش موکلین
                </p>
              </div>
            </label>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={
              submitting
            }
            onClick={
              onClose
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              !selectedId
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <UserPlus
                size={17}
              />
            )}

            {submitting
              ? 'در حال افزودن...'
              : 'افزودن به بخش موکلین'}
          </button>
        </footer>
      </form>
    </div>
  )
}
