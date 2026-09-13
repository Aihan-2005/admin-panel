'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowDown,
  ArrowUp,
  Eye,
  Plus,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'

import {
  AccountStatusBadge,
} from '@/components/common/AccountStatusBadge'

import {
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import {
  LawyerStatusBadge,
} from '@/components/lawyers/LawyerStatusBadge'

import {
  AddClientLawyerModal,
} from '@/components/client-lawyers/AddClientLawyerModal'

import {
  getLawyers,
} from '@/services/lawyer.service'

import {
  addClientLawyer,
  getClientLawyerPlacements,
  moveClientLawyer,
  removeClientLawyer,
  updateClientLawyer,
} from '@/services/client-lawyer.service'

import type {
  ClientLawyerPlacement,
  ManagedClientLawyer,
  AddClientLawyerPayload,
} from '@/types/client-lawyer'

import type {
  Lawyer,
} from '@/types/lawyer'

export default function ClientLawyersPage() {
  const [
    lawyers,
    setLawyers,
  ] =
    useState<Lawyer[]>(
      [],
    )

  const [
    placements,
    setPlacements,
  ] =
    useState<
      ClientLawyerPlacement[]
    >([])

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

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const loadData =
    useCallback(
      async (
        showLoading = true,
      ) => {
        try {
          if (
            showLoading
          ) {
            setLoading(
              true,
            )
          }

          setError(null)

          const [
            lawyerList,
            placementList,
          ] =
            await Promise.all([
              getLawyers({
                sortBy:
                  'fullName',

                sortOrder:
                  'asc',
              }),

              getClientLawyerPlacements(),
            ])

          setLawyers(
            lawyerList,
          )

          setPlacements(
            placementList,
          )
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت اطلاعات',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },
      [],
    )

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedIds =
    useMemo(
      () =>
        new Set(
          placements.map(
            (item) =>
              item.lawyerId,
          ),
        ),
      [placements],
    )

  const managedLawyers =
    useMemo(() => {
      const lawyerMap =
        new Map(
          lawyers.map(
            (lawyer) => [
              lawyer.id,
              lawyer,
            ],
          ),
        )

      return placements
        .map(
          (
            placement,
          ) => {
            const lawyer =
              lawyerMap.get(
                placement.lawyerId,
              )

            if (!lawyer) {
              return null
            }

            return {
              ...lawyer,

              ...placement,
            } satisfies ManagedClientLawyer
          },
        )
        .filter(
          (
            item,
          ): item is ManagedClientLawyer =>
            item !==
            null,
        )
        .sort(
          (a, b) =>
            a.displayOrder -
            b.displayOrder,
        )
    }, [
      lawyers,
      placements,
    ])

  const availableLawyers =
    useMemo(
      () =>
        lawyers.filter(
          (lawyer) =>
            !selectedIds.has(
              lawyer.id,
            ) &&
            lawyer.state ===
              'ACTIVE' &&
            lawyer.accountStatus ===
              'ACTIVE',
        ),
      [
        lawyers,
        selectedIds,
      ],
    )

  const filteredManagedLawyers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      if (!query) {
        return managedLawyers
      }

      return managedLawyers.filter(
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
      managedLawyers,
      search,
    ])

  const featuredCount =
    managedLawyers.filter(
      (lawyer) =>
        lawyer.isFeatured,
    ).length

  const unavailableCount =
    managedLawyers.filter(
      (lawyer) =>
        lawyer.state !==
          'ACTIVE' ||
        lawyer.accountStatus !==
          'ACTIVE',
    ).length

  async function handleAdd(
    payload: AddClientLawyerPayload,
  ) {
    const next =
      await addClientLawyer(
        payload,
      )

    setPlacements(
      next,
    )

    setModalOpen(
      false,
    )

    const lawyer =
      lawyers.find(
        (item) =>
          item.id ===
          payload.lawyerId,
      )

    setSuccess(
      lawyer
        ? `${lawyer.fullName} به بخش موکلین اضافه شد.`
        : 'وکیل با موفقیت اضافه شد.',
    )

    setError(null)
  }

  async function toggleFeatured(
    lawyer:
      ManagedClientLawyer,
  ) {
    try {
      const next =
        await updateClientLawyer(
          lawyer.lawyerId,
          {
            isFeatured:
              !lawyer.isFeatured,
          },
        )

      setPlacements(
        next,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت ناموفق بود.',
      )
    }
  }

  async function move(
    lawyerId: string,
    direction:
      | 'up'
      | 'down',
  ) {
    try {
      const next =
        await moveClientLawyer(
          lawyerId,
          direction,
        )

      setPlacements(
        next,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر ترتیب ناموفق بود.',
      )
    }
  }

  async function remove(
    lawyer:
      ManagedClientLawyer,
  ) {
    const confirmed =
      window.confirm(
        `${lawyer.fullName} از بخش وکلای قابل نمایش به موکلین حذف شود؟ حساب وکیل حذف نخواهد شد.`,
      )

    if (!confirmed) {
      return
    }

    try {
      const next =
        await removeClientLawyer(
          lawyer.lawyerId,
        )

      setPlacements(
        next,
      )

      setSuccess(
        `${lawyer.fullName} از بخش موکلین حذف شد.`,
      )

      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'حذف وکیل ناموفق بود.',
      )
    }
  }

  if (loading) {
    return (
      <LoadingState label="در حال دریافت وکلا..." />
    )
  }

  return (
    <>
      <div
        dir="rtl"
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={26}
                className="text-blue-600"
              />

              <h1 className="text-2xl font-black text-zinc-950">
                وکلای بخش موکلین
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500">
              تعیین کنید کدام وکلای
              فعال سامانه در بخش
              انتخاب وکیل برای موکلین
              سایت نمایش داده شوند.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void loadData(
                  false,
                )
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
            >
              <RefreshCcw
                size={16}
              />

              بروزرسانی
            </button>

            <button
              type="button"
              disabled={
                availableLawyers.length ===
                0
              }
              onClick={() => {
                setError(
                  null,
                )

                setSuccess(
                  null,
                )

                setModalOpen(
                  true,
                )
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus
                size={18}
              />

              افزودن وکیل
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          این نسخه فعلاً فقط Frontend
          است؛ انتخاب‌ها روی همین
          مرورگر ذخیره می‌شوند. بعد از
          اضافه شدن API بک‌اند، همین
          صفحه به دیتابیس متصل خواهد
          شد.
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="کل وکلای منتشرشده"
            value={
              managedLawyers.length
            }
            icon={
              <Users
                size={19}
              />
            }
          />

          <StatCard
            title="وکلای ویژه"
            value={
              featuredCount
            }
            icon={
              <Star
                size={19}
              />
            }
          />

          <StatCard
            title="قابل افزودن"
            value={
              availableLawyers.length
            }
            icon={
              <Plus
                size={19}
              />
            }
          />

          <StatCard
            title="نیازمند بررسی"
            value={
              unavailableCount
            }
            icon={
              <Eye
                size={19}
              />
            }
          />
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="relative max-w-xl">
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
              placeholder="جستجو بین وکلای بخش موکلین..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {filteredManagedLawyers.length ===
          0 ? (
            <div className="p-12 text-center">
              <UserRound
                size={42}
                className="mx-auto text-zinc-300"
              />

              <h2 className="mt-4 font-black text-zinc-800">
                هنوز وکیلی اضافه نشده
                است
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-zinc-500">
                با دکمه «افزودن وکیل»
                یکی از وکلای فعال
                سامانه را برای نمایش به
                موکلین انتخاب کنید.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-right text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3">
                      ترتیب
                    </th>

                    <th className="px-4 py-3">
                      وکیل
                    </th>

                    <th className="px-4 py-3">
                      تماس
                    </th>

                    <th className="px-4 py-3">
                      تخصص
                    </th>

                    <th className="px-4 py-3">
                      وضعیت حرفه‌ای
                    </th>

                    <th className="px-4 py-3">
                      اکانت
                    </th>

                    <th className="px-4 py-3">
                      ویژه
                    </th>

                    <th className="px-4 py-3">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredManagedLawyers.map(
                    (
                      lawyer,
                      index,
                    ) => {
                      const unavailable =
                        lawyer.state !==
                          'ACTIVE' ||
                        lawyer.accountStatus !==
                          'ACTIVE'

                      return (
                        <tr
                          key={
                            lawyer.id
                          }
                          className={
                            unavailable
                              ? 'bg-red-50/40'
                              : 'hover:bg-zinc-50'
                          }
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 font-black">
                                {new Intl.NumberFormat(
                                  'fa-IR',
                                ).format(
                                  lawyer.displayOrder,
                                )}
                              </span>

                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={
                                    index ===
                                    0
                                  }
                                  onClick={() =>
                                    void move(
                                      lawyer.lawyerId,
                                      'up',
                                    )
                                  }
                                  className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-20"
                                >
                                  <ArrowUp
                                    size={
                                      14
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    index ===
                                    filteredManagedLawyers.length -
                                      1
                                  }
                                  onClick={() =>
                                    void move(
                                      lawyer.lawyerId,
                                      'down',
                                    )
                                  }
                                  className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-20"
                                >
                                  <ArrowDown
                                    size={
                                      14
                                    }
                                  />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-black text-zinc-900">
                              {
                                lawyer.fullName
                              }
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              پروانه:{' '}
                              {lawyer.licenseNumber ||
                                '—'}
                            </p>

                            {unavailable && (
                              <p className="mt-2 text-xs font-bold text-red-600">
                                این وکیل فعلاً نباید
                                در سایت نمایش داده
                                شود.
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <p
                                dir="ltr"
                                className="w-fit text-xs text-zinc-600"
                              >
                                {lawyer.phone ||
                                  '—'}
                              </p>

                              <p
                                dir="ltr"
                                className="w-fit text-xs text-zinc-400"
                              >
                                {lawyer.email ||
                                  ''}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-zinc-600">
                            {lawyer.specialization ||
                              '—'}
                          </td>

                          <td className="px-4 py-4">
                            <LawyerStatusBadge
                              state={
                                lawyer.state
                              }
                            />
                          </td>

                          <td className="px-4 py-4">
                            <AccountStatusBadge
                              status={
                                lawyer.accountStatus
                              }
                            />
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                void toggleFeatured(
                                  lawyer,
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${
                                lawyer.isFeatured
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                              }`}
                            >
                              <Star
                                size={
                                  15
                                }
                                className={
                                  lawyer.isFeatured
                                    ? 'fill-amber-400'
                                    : ''
                                }
                              />

                              {lawyer.isFeatured
                                ? 'ویژه'
                                : 'عادی'}
                            </button>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                void remove(
                                  lawyer,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />

                              حذف از این بخش
                            </button>
                          </td>
                        </tr>
                      )
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AddClientLawyerModal
        open={
          modalOpen
        }
        lawyers={
          availableLawyers
        }
        nextOrder={
          placements.length +
          1
        }
        onClose={() =>
          setModalOpen(
            false,
          )
        }
        onAdd={
          handleAdd
        }
      />
    </>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string

  value: number

  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        {icon}

        {title}
      </div>

      <p className="mt-3 text-2xl font-black text-zinc-950">
        {new Intl.NumberFormat(
          'fa-IR',
        ).format(
          value,
        )}
      </p>
    </div>
  )
}

