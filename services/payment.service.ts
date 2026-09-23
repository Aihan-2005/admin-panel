import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  AdminPayment,
  AdminPaymentListQuery,
  AdminPaymentListResult,
  PaymentPagination,
  ReconcileAdminPaymentResult,
} from '@/types/payment'


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


interface PaymentListEnvelope<T>
  extends ApiEnvelope<T> {
  pagination:
    PaymentPagination
}


function assertSuccess<T>(
  response:
    ApiEnvelope<T>,

  fallbackMessage:
    string,
): T {
  if (
    response.success !==
    true
  ) {
    throw new Error(
      response.message ||
      fallbackMessage,
    )
  }

  return response.data
}


function normalizeId(
  id:
    string,
): string {
  const normalized =
    id.trim()

  if (
    !normalized
  ) {
    throw new Error(
      'شناسه پرداخت معتبر نیست.',
    )
  }

  return normalized
}


export async function getAdminPayments(
  query:
    AdminPaymentListQuery = {},
): Promise<AdminPaymentListResult> {
  const search =
    buildQuery({
      lawyerId:
        query.lawyerId,

      status:
        query.status,

      fulfillmentStatus:
        query.fulfillmentStatus,

      provider:
        query.provider,

      page:
        query.page ??
        1,

      limit:
        query.limit ??
        20,
    })


  const response =
    await apiRequest<
      PaymentListEnvelope<
        AdminPayment[]
      >
    >(
      `${API_ENDPOINTS.payments}${search}`,
    )


  const items =
    assertSuccess(
      response,
      'دریافت لیست پرداخت‌ها ناموفق بود.',
    )


  if (
    !Array.isArray(
      items,
    )
  ) {
    throw new Error(
      'ساختار پاسخ لیست پرداخت‌ها معتبر نیست.',
    )
  }


  return {
    items,

    pagination:
      response.pagination,
  }
}


export async function getAdminPayment(
  id:
    string,
): Promise<AdminPayment> {
  const paymentId =
    normalizeId(
      id,
    )


  const response =
    await apiRequest<
      ApiEnvelope<AdminPayment>
    >(
      API_ENDPOINTS.payment(
        paymentId,
      ),
    )


  return assertSuccess(
    response,
    'دریافت اطلاعات پرداخت ناموفق بود.',
  )
}


export async function reconcileAdminPayment(
  id:
    string,
): Promise<ReconcileAdminPaymentResult> {
  const paymentId =
    normalizeId(
      id,
    )


  const response =
    await apiRequest<
      ApiEnvelope<
        ReconcileAdminPaymentResult
      >
    >(
      API_ENDPOINTS.paymentReconcile(
        paymentId,
      ),

      {
        method:
          'POST',
      },
    )


  return assertSuccess(
    response,
    'استعلام وضعیت پرداخت از درگاه ناموفق بود.',
  )
}


export async function retryAdminPaymentFulfillment(
  id:
    string,
): Promise<AdminPayment> {
  const paymentId =
    normalizeId(
      id,
    )


  const response =
    await apiRequest<
      ApiEnvelope<AdminPayment>
    >(
      API_ENDPOINTS
        .paymentRetryFulfillment(
          paymentId,
        ),

      {
        method:
          'POST',
      },
    )


  return assertSuccess(
    response,
    'فعال‌سازی مجدد اشتراک ناموفق بود.',
  )
}