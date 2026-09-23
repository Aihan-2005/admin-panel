'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react'

import {
  getAdminPayment,
  getAdminPayments,
  reconcileAdminPayment,
  retryAdminPaymentFulfillment,
} from '@/services/payment.service'

import type {
  AdminPayment,
  PaymentFulfillmentStatus,
  PaymentStatus,
} from '@/types/payment'


const numberFormatter =
  new Intl.NumberFormat(
    'fa-IR',
    {
      maximumFractionDigits:
        1,
    },
  )


const dateTimeFormatter =
  new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  )


function formatDateTime(
  value:
    string |
    null,
): string {
  if (
    !value
  ) {
    return '—'
  }


  const date =
    new Date(
      value,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }


  return dateTimeFormatter
    .format(
      date,
    )
}


function formatPaymentAmount(
  amount:
    number,

  currency:
    string,
): string {
  /**
   * Payment.amount در بک‌اند مقدار واقعی
   * درگاه و بر حسب ریال است.
   *
   * UI ادمین برای هماهنگی با قیمت پلن‌ها
   * مقدار را به تومان نمایش می‌دهد.
   */
  if (
    currency ===
    'IRR'
  ) {
    return `${numberFormatter.format(
      amount /
      10,
    )} تومان`
  }


  return `${numberFormatter.format(
    amount,
  )} ${currency}`
}


function formatRawRial(
  amount:
    number,
): string {
  return `${numberFormatter.format(
    amount,
  )} ریال`
}


function getPaymentStatusLabel(
  status:
    PaymentStatus,
): string {
  switch (
    status
  ) {
    case 'PENDING':
      return 'در انتظار'

    case 'PAID':
      return 'پرداخت‌شده'

    case 'FAILED':
      return 'ناموفق'

    case 'CANCELLED':
      return 'لغوشده'

    case 'REVERSED':
      return 'برگشت‌خورده'
  }
}


function getFulfillmentStatusLabel(
  status:
    PaymentFulfillmentStatus,
): string {
  switch (
    status
  ) {
    case 'PENDING':
      return 'در انتظار فعال‌سازی'

    case 'FULFILLED':
      return 'اشتراک فعال شده'

    case 'REQUIRES_ACTION':
      return 'نیازمند بررسی'

    case 'NOT_APPLICABLE':
      return 'غیرقابل اعمال'
  }
}


function paymentStatusClass(
  status:
    PaymentStatus,
): string {
  switch (
    status
  ) {
    case 'PAID':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'PENDING':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'FAILED':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'CANCELLED':
      return 'border-zinc-200 bg-zinc-100 text-zinc-600'

    case 'REVERSED':
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}


function fulfillmentStatusClass(
  status:
    PaymentFulfillmentStatus,
): string {
  switch (
    status
  ) {
    case 'FULFILLED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'PENDING':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'REQUIRES_ACTION':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'NOT_APPLICABLE':
      return 'border-zinc-200 bg-zinc-100 text-zinc-600'
  }
}


export default function PaymentsPage() {
  const [
    payments,
    setPayments,
  ] =
    useState<
      AdminPayment[]
    >([])


  const [
    page,
    setPage,
  ] =
    useState(
      1,
    )


  const [
    total,
    setTotal,
  ] =
    useState(
      0,
    )


  const [
    totalPages,
    setTotalPages,
  ] =
    useState(
      0,
    )


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      PaymentStatus |
      'ALL'
    >(
      'ALL',
    )


  const [
    fulfillmentFilter,
    setFulfillmentFilter,
  ] =
    useState<
      PaymentFulfillmentStatus |
      'ALL'
    >(
      'ALL',
    )


  const [
    lawyerId,
    setLawyerId,
  ] =
    useState(
      '',
    )


  const [
    appliedLawyerId,
    setAppliedLawyerId,
  ] =
    useState(
      '',
    )


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    )


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    )


  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(
      null,
    )


  const [
    success,
    setSuccess,
  ] =
    useState<
      string |
      null
    >(
      null,
    )


  const [
    selectedPayment,
    setSelectedPayment,
  ] =
    useState<
      AdminPayment |
      null
    >(
      null,
    )


  const [
    detailsLoading,
    setDetailsLoading,
  ] =
    useState(
      false,
    )


  const [
    action,
    setAction,
  ] =
    useState<
      'RECONCILE' |
      'RETRY' |
      null
    >(
      null,
    )


  const loadPayments =
    useCallback(
      async (
        refresh =
          false,
      ) => {
        try {
          if (
            refresh
          ) {
            setRefreshing(
              true,
            )
          } else {
            setLoading(
              true,
            )
          }


          setError(
            null,
          )


          const result =
            await getAdminPayments({
              page,

              limit:
                20,

              ...(statusFilter !==
              'ALL'
                ? {
                    status:
                      statusFilter,
                  }
                : {}),

              ...(fulfillmentFilter !==
              'ALL'
                ? {
                    fulfillmentStatus:
                      fulfillmentFilter,
                  }
                : {}),

              ...(appliedLawyerId
                ? {
                    lawyerId:
                      appliedLawyerId,
                  }
                : {}),
            })


          setPayments(
            result.items,
          )


          setTotal(
            result
              .pagination
              .total,
          )


          setTotalPages(
            result
              .pagination
              .totalPages,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پرداخت‌ها ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )

          setRefreshing(
            false,
          )
        }
      },
      [
        appliedLawyerId,
        fulfillmentFilter,
        page,
        statusFilter,
      ],
    )


  useEffect(
    () => {
      void loadPayments()
    },
    [
      loadPayments,
    ],
  )


  const pagePaidCount =
    useMemo(
      () =>
        payments.filter(
          (
            payment,
          ) =>
            payment.status ===
            'PAID',
        ).length,
      [
        payments,
      ],
    )


  const pageRequiresAction =
    useMemo(
      () =>
        payments.filter(
          (
            payment,
          ) =>
            payment
              .fulfillmentStatus ===
            'REQUIRES_ACTION',
        ).length,
      [
        payments,
      ],
    )


  function updatePayment(
    nextPayment:
      AdminPayment,
  ) {
    setPayments(
      (
        previous,
      ) =>
        previous.map(
          (
            payment,
          ) =>
            payment.id ===
            nextPayment.id
              ? nextPayment
              : payment,
        ),
    )


    setSelectedPayment(
      (
        previous,
      ) =>
        previous?.id ===
        nextPayment.id
          ? nextPayment
          : previous,
    )
  }


  async function openPayment(
    id:
      string,
  ) {
    try {
      setDetailsLoading(
        true,
      )

      setError(
        null,
      )

      const result =
        await getAdminPayment(
          id,
        )


      setSelectedPayment(
        result,
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'دریافت جزئیات پرداخت ناموفق بود.',
      )
    } finally {
      setDetailsLoading(
        false,
      )
    }
  }


  async function handleReconcile() {
    if (
      !selectedPayment ||
      action
    ) {
      return
    }


    try {
      setAction(
        'RECONCILE',
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      const result =
        await reconcileAdminPayment(
          selectedPayment.id,
        )


      updatePayment(
        result.payment,
      )


      setSuccess(
        result.reconciled
          ? 'وضعیت پرداخت با اطلاعات زرین‌پال همگام شد.'
          : 'وضعیت پرداخت بررسی شد و تغییری لازم نبود.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'استعلام پرداخت ناموفق بود.',
      )
    } finally {
      setAction(
        null,
      )
    }
  }


  async function handleRetryFulfillment() {
    if (
      !selectedPayment ||
      action
    ) {
      return
    }


    try {
      setAction(
        'RETRY',
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      const result =
        await retryAdminPaymentFulfillment(
          selectedPayment.id,
        )


      updatePayment(
        result,
      )


      setSuccess(
        'فعال‌سازی اشتراک با موفقیت انجام شد.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'فعال‌سازی مجدد اشتراک ناموفق بود.',
      )
    } finally {
      setAction(
        null,
      )
    }
  }


  function applyLawyerFilter() {
    setPage(
      1,
    )

    setAppliedLawyerId(
      lawyerId.trim(),
    )
  }


  return (
    <div
      dir="rtl"
      className="mx-auto max-w-7xl space-y-6"
    >
      <section className="rounded-[26px] border border-zinc-200 bg-gradient-to-l from-blue-50 via-white to-violet-50 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <CreditCard
                size={
                  20
                }
              />

              <p className="text-xs font-black">
                مالی
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-black text-zinc-950">
              مدیریت پرداخت‌ها
            </h1>

            <p className="mt-2 text-sm font-semibold leading-7 text-zinc-500">
              تراکنش‌های زرین‌پال، وضعیت پرداخت و فعال‌سازی اشتراک‌ها
              را بررسی کنید.
            </p>
          </div>

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              void loadPayments(
                true,
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-black transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshCcw
              size={
                17
              }
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            بروزرسانی
          </button>
        </div>
      </section>


      {
        error &&
        (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
            {
              error
            }
          </div>
        )
      }


      {
        success &&
        (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-7 text-emerald-700">
            {
              success
            }
          </div>
        )
      }


      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="کل نتایج"
          value={
            total
          }
          icon={
            CreditCard
          }
        />

        <StatCard
          label="پرداخت‌شده در این صفحه"
          value={
            pagePaidCount
          }
          icon={
            CheckCircle2
          }
        />

        <StatCard
          label="نیازمند بررسی در این صفحه"
          value={
            pageRequiresAction
          }
          icon={
            ShieldAlert
          }
        />
      </section>


      <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 lg:grid-cols-[1fr_220px_220px_auto]">
        <input
          value={
            lawyerId
          }
          onChange={(
            event,
          ) =>
            setLawyerId(
              event.target
                .value,
            )
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              applyLawyerFilter()
            }
          }}
          placeholder="شناسه وکیل"
          dir="ltr"
          className="h-11 rounded-xl border border-zinc-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
        />


        <select
          value={
            statusFilter
          }
          onChange={(
            event,
          ) => {
            setPage(
              1,
            )

            setStatusFilter(
              event.target
                .value as
                PaymentStatus |
                'ALL',
            )
          }}
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500"
        >
          <option value="ALL">
            همه وضعیت‌های پرداخت
          </option>

          <option value="PENDING">
            در انتظار
          </option>

          <option value="PAID">
            پرداخت‌شده
          </option>

          <option value="FAILED">
            ناموفق
          </option>

          <option value="CANCELLED">
            لغوشده
          </option>

          <option value="REVERSED">
            برگشت‌خورده
          </option>
        </select>


        <select
          value={
            fulfillmentFilter
          }
          onChange={(
            event,
          ) => {
            setPage(
              1,
            )

            setFulfillmentFilter(
              event.target
                .value as
                PaymentFulfillmentStatus |
                'ALL',
            )
          }}
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500"
        >
          <option value="ALL">
            همه وضعیت‌های فعال‌سازی
          </option>

          <option value="PENDING">
            در انتظار
          </option>

          <option value="FULFILLED">
            فعال شده
          </option>

          <option value="REQUIRES_ACTION">
            نیازمند بررسی
          </option>

          <option value="NOT_APPLICABLE">
            غیرقابل اعمال
          </option>
        </select>


        <button
          type="button"
          onClick={
            applyLawyerFilter
          }
          className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"
        >
          اعمال فیلتر
        </button>
      </section>


      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {
          loading
            ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={
                      28
                    }
                    className="mx-auto animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-sm font-black text-zinc-600">
                    در حال دریافت پرداخت‌ها...
                  </p>
                </div>
              </div>
            )
            : payments.length ===
              0
              ? (
                <div className="p-10 text-center text-sm font-bold text-zinc-500">
                  تراکنشی با این شرایط پیدا نشد.
                </div>
              )
              : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-right text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 font-black text-zinc-600">
                          پلن
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          وکیل
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          مبلغ
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          پرداخت
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          فعال‌سازی
                        </th>

                        <th className="px-4 py-3 font-black text-zinc-600">
                          زمان
                        </th>

                        <th className="px-4 py-3" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100">
                      {
                        payments.map(
                          (
                            payment,
                          ) => (
                            <tr
                              key={
                                payment.id
                              }
                              className="transition hover:bg-zinc-50"
                            >
                              <td className="px-4 py-4">
                                <p className="font-black text-zinc-900">
                                  {
                                    payment
                                      .plan
                                      .title
                                  }
                                </p>

                                <p className="mt-1 text-xs font-semibold text-zinc-400">
                                  {
                                    payment
                                      .plan
                                      .tier
                                  }
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <Link
                                  href={`/lawyers/${payment.lawyerId}`}
                                  dir="ltr"
                                  className="font-mono text-xs font-bold text-blue-700 hover:underline"
                                >
                                  {
                                    payment.lawyerId
                                  }
                                </Link>
                              </td>

                              <td className="px-4 py-4 font-black">
                                {
                                  formatPaymentAmount(
                                    payment.amount,

                                    payment.currency,
                                  )
                                }
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${paymentStatusClass(
                                    payment.status,
                                  )}`}
                                >
                                  {
                                    getPaymentStatusLabel(
                                      payment.status,
                                    )
                                  }
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${fulfillmentStatusClass(
                                    payment.fulfillmentStatus,
                                  )}`}
                                >
                                  {
                                    getFulfillmentStatusLabel(
                                      payment.fulfillmentStatus,
                                    )
                                  }
                                </span>
                              </td>

                              <td className="px-4 py-4 text-xs font-semibold text-zinc-500">
                                {
                                  formatDateTime(
                                    payment.createdAt,
                                  )
                                }
                              </td>

                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openPayment(
                                      payment.id,
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-black text-white"
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
                        )
                      }
                    </tbody>
                  </table>
                </div>
              )
        }
      </section>


      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold text-zinc-500">
          صفحه
          {' '}
          {
            numberFormatter.format(
              page,
            )
          }
          {' از '}
          {
            numberFormatter.format(
              Math.max(
                totalPages,
                1,
              ),
            )
          }
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={
              page <=
              1 ||
              loading
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
            className="h-10 rounded-xl border border-zinc-300 bg-white px-4 text-xs font-black disabled:opacity-40"
          >
            قبلی
          </button>

          <button
            type="button"
            disabled={
              page >=
              totalPages ||
              loading ||
              totalPages ===
              0
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
            className="h-10 rounded-xl border border-zinc-300 bg-white px-4 text-xs font-black disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      </div>


      {
        (
          selectedPayment ||
          detailsLoading
        ) &&
        (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div
              dir="rtl"
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white p-6 shadow-2xl"
            >
              {
                detailsLoading
                  ? (
                    <div className="flex min-h-64 items-center justify-center">
                      <Loader2
                        size={
                          28
                        }
                        className="animate-spin text-blue-600"
                      />
                    </div>
                  )
                  : selectedPayment &&
                    (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black text-blue-700">
                              جزئیات تراکنش
                            </p>

                            <h2 className="mt-1 text-xl font-black">
                              {
                                selectedPayment
                                  .plan
                                  .title
                              }
                            </h2>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayment(
                                null,
                              )
                            }
                            className="rounded-xl bg-zinc-100 p-2 text-zinc-600"
                          >
                            <X
                              size={
                                20
                              }
                            />
                          </button>
                        </div>


                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <DetailRow
                            label="مبلغ نمایشی"
                            value={
                              formatPaymentAmount(
                                selectedPayment.amount,

                                selectedPayment.currency,
                              )
                            }
                          />

                          <DetailRow
                            label="مبلغ واقعی درگاه"
                            value={
                              formatRawRial(
                                selectedPayment.amount,
                              )
                            }
                          />

                          <DetailRow
                            label="وضعیت پرداخت"
                            value={
                              getPaymentStatusLabel(
                                selectedPayment.status,
                              )
                            }
                          />

                          <DetailRow
                            label="وضعیت فعال‌سازی"
                            value={
                              getFulfillmentStatusLabel(
                                selectedPayment.fulfillmentStatus,
                              )
                            }
                          />

                          <DetailRow
                            label="درگاه"
                            value={
                              selectedPayment.provider
                            }
                          />

                          <DetailRow
                            label="زمان ایجاد"
                            value={
                              formatDateTime(
                                selectedPayment.createdAt,
                              )
                            }
                          />

                          <DetailRow
                            label="شناسه پرداخت"
                            value={
                              selectedPayment.id
                            }
                            ltr
                          />

                          <DetailRow
                            label="شناسه وکیل"
                            value={
                              selectedPayment.lawyerId
                            }
                            ltr
                          />

                          <DetailRow
                            label="Authority"
                            value={
                              selectedPayment.authority ??
                              '—'
                            }
                            ltr
                          />

                          <DetailRow
                            label="شماره پیگیری"
                            value={
                              selectedPayment.referenceId ??
                              '—'
                            }
                            ltr
                          />

                          <DetailRow
                            label="کارت"
                            value={
                              selectedPayment.cardPan ??
                              '—'
                            }
                            ltr
                          />

                          <DetailRow
                            label="شناسه اشتراک"
                            value={
                              selectedPayment.subscriptionId ??
                              '—'
                            }
                            ltr
                          />

                          <DetailRow
                            label="زمان پرداخت"
                            value={
                              formatDateTime(
                                selectedPayment.paidAt,
                              )
                            }
                          />

                          <DetailRow
                            label="زمان فعال‌سازی"
                            value={
                              formatDateTime(
                                selectedPayment.fulfilledAt,
                              )
                            }
                          />
                        </div>


                        {
                          selectedPayment.failureMessage &&
                          (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                              <div className="flex items-center gap-2 font-black text-red-700">
                                <XCircle
                                  size={
                                    17
                                  }
                                />

                                خطای پرداخت
                              </div>

                              <p
                                dir="ltr"
                                className="mt-2 break-words text-left text-xs font-semibold leading-6 text-red-700"
                              >
                                {
                                  selectedPayment.failureCode
                                }
                                {' — '}
                                {
                                  selectedPayment.failureMessage
                                }
                              </p>
                            </div>
                          )
                        }


                        {
                          selectedPayment.fulfillmentErrorMessage &&
                          (
                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                              <div className="flex items-center gap-2 font-black text-amber-800">
                                <AlertTriangle
                                  size={
                                    17
                                  }
                                />

                                خطای فعال‌سازی
                              </div>

                              <p
                                dir="ltr"
                                className="mt-2 break-words text-left text-xs font-semibold leading-6 text-amber-700"
                              >
                                {
                                  selectedPayment.fulfillmentErrorCode
                                }
                                {' — '}
                                {
                                  selectedPayment.fulfillmentErrorMessage
                                }
                              </p>
                            </div>
                          )
                        }


                        <div className="mt-6 grid gap-2 sm:grid-cols-2">
                          {
                            selectedPayment.status ===
                              'PENDING' &&
                            selectedPayment.authority &&
                            (
                              <button
                                type="button"
                                disabled={
                                  action !==
                                  null
                                }
                                onClick={() =>
                                  void handleReconcile()
                                }
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white disabled:opacity-50"
                              >
                                {
                                  action ===
                                    'RECONCILE'
                                    ? (
                                      <Loader2
                                        size={
                                          17
                                        }
                                        className="animate-spin"
                                      />
                                    )
                                    : (
                                      <RefreshCcw
                                        size={
                                          17
                                        }
                                      />
                                    )
                                }

                                استعلام از زرین‌پال
                              </button>
                            )
                          }


                          {
                            selectedPayment.status ===
                              'PAID' &&
                            selectedPayment.fulfillmentStatus ===
                              'REQUIRES_ACTION' &&
                            (
                              <button
                                type="button"
                                disabled={
                                  action !==
                                  null
                                }
                                onClick={() =>
                                  void handleRetryFulfillment()
                                }
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 text-sm font-black text-white disabled:opacity-50"
                              >
                                {
                                  action ===
                                    'RETRY'
                                    ? (
                                      <Loader2
                                        size={
                                          17
                                        }
                                        className="animate-spin"
                                      />
                                    )
                                    : (
                                      <RotateCcw
                                        size={
                                          17
                                        }
                                      />
                                    )
                                }

                                تلاش مجدد فعال‌سازی
                              </button>
                            )
                          }
                        </div>
                      </>
                    )
              }
            </div>
          </div>
        )
      }
    </div>
  )
}


function StatCard({
  label,
  value,
  icon:
    Icon,
}: {
  label:
    string

  value:
    number

  icon:
    typeof CreditCard
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-zinc-500">
        <Icon
          size={
            17
          }
          className="text-blue-600"
        />

        {
          label
        }
      </div>

      <p className="mt-3 text-2xl font-black">
        {
          numberFormatter.format(
            value,
          )
        }
      </p>
    </article>
  )
}


function DetailRow({
  label,
  value,
  ltr =
    false,
}: {
  label:
    string

  value:
    string

  ltr?:
    boolean
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-[11px] font-black text-zinc-400">
        {
          label
        }
      </p>

      <p
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="mt-2 break-all text-sm font-black text-zinc-800"
      >
        {
          value
        }
      </p>
    </div>
  )
}