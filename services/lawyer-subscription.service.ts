import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  LawyerSubscription,
  LawyerSubscriptionActivationSource,
  LawyerSubscriptionHistoryResult,
  LawyerSubscriptionPagination,
  LawyerSubscriptionPlanSnapshot,
  LawyerSubscriptionStatus,
} from '@/types/lawyer-subscription'


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


interface BackendPagination {
  page?:
    unknown

  limit?:
    unknown

  total?:
    unknown

  totalPages?:
    unknown
}


interface BackendHistoryResponse {
  success:
    boolean

  data:
    unknown

  pagination?:
    BackendPagination

  message?:
    string
}


interface BackendSubscriptionResponse {
  success:
    boolean

  data:
    unknown

  message?:
    string
}


interface LawyerSubscriptionHistoryParams {
  page?:
    number

  limit?:
    number
}


function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
    value !==
      null
  )
}


function readString(
  value:
    unknown,
): string {
  return typeof value ===
    'string'
    ? value
    : ''
}


function readNullableString(
  value:
    unknown,
): string | null {
  return typeof value ===
    'string'
    ? value
    : null
}


function readNumber(
  value:
    unknown,

  fallback =
    0,
): number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : fallback
}


function readStringArray(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return []
  }


  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
        'string',
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    )
}


function readObjectId(
  value:
    unknown,
): string {
  if (
    typeof value ===
    'string'
  ) {
    return value
  }


  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return ''
  }


  return String(
    value,
  )
}


function readStatus(
  value:
    unknown,
): LawyerSubscriptionStatus {
  switch (
    value
  ) {
    case 'ACTIVE':
    case 'EXPIRED':
    case 'CANCELLED':
      return value

    default:
      throw new Error(
        'وضعیت اشتراک دریافت‌شده از Backend معتبر نیست.',
      )
  }
}


function readActivationSource(
  value:
    unknown,
): LawyerSubscriptionActivationSource {
  switch (
    value
  ) {
    case 'ADMIN':
    case 'PAYMENT':
      return value

    default:
      throw new Error(
        'منبع فعال‌سازی اشتراک معتبر نیست.',
      )
  }
}


function mapPlanSnapshot(
  value:
    unknown,
): LawyerSubscriptionPlanSnapshot {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      'اطلاعات Snapshot پلن اشتراک معتبر نیست.',
    )
  }


  return {
    title:
      readString(
        value.title,
      ),

    description:
      readString(
        value.description,
      ),

    tier:
      readString(
        value.tier,
      ),

    tags:
      readStringArray(
        value.tags,
      ),

    durationMonths:
      readNumber(
        value.durationMonths,
      ),

    price:
      readNumber(
        value.price,
      ),

    discountPercent:
      readNumber(
        value.discountPercent,
      ),

    features:
      readStringArray(
        value.features,
      ),
  }
}


function mapSubscription(
  value:
    unknown,
): LawyerSubscription {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      'ساختار اشتراک وکیل معتبر نیست.',
    )
  }


  const id =
    readObjectId(
      value._id ??
      value.id,
    )


  if (
    !id
  ) {
    throw new Error(
      'Backend شناسه اشتراک معتبر برنگرداند.',
    )
  }


  return {
    id,

    lawyerId:
      readObjectId(
        value.lawyerId,
      ),

    planId:
      readObjectId(
        value.planId,
      ),

    planSnapshot:
      mapPlanSnapshot(
        value.planSnapshot,
      ),

    startsAt:
      readString(
        value.startsAt,
      ),

    endsAt:
      readString(
        value.endsAt,
      ),

    cancelledAt:
      readNullableString(
        value.cancelledAt,
      ),

    activationSource:
      readActivationSource(
        value.activationSource,
      ),

    activatedByUserId:
      readNullableString(
        value.activatedByUserId,
      ),

    createdAt:
      readString(
        value.createdAt,
      ),

    updatedAt:
      readString(
        value.updatedAt,
      ),

    status:
      readStatus(
        value.status,
      ),
  }
}


function normalizePagination(
  value:
    BackendPagination | undefined,

  fallbackPage:
    number,

  fallbackLimit:
    number,
): LawyerSubscriptionPagination {
  return {
    page:
      readNumber(
        value?.page,
        fallbackPage,
      ),

    limit:
      readNumber(
        value?.limit,
        fallbackLimit,
      ),

    total:
      readNumber(
        value?.total,
        0,
      ),

    totalPages:
      readNumber(
        value?.totalPages,
        0,
      ),
  }
}


export async function getLawyerSubscriptionHistory(
  lawyerId:
    string,

  params:
    LawyerSubscriptionHistoryParams = {},
): Promise<LawyerSubscriptionHistoryResult> {
  const id =
    lawyerId.trim()


  if (
    !id
  ) {
    throw new Error(
      'شناسه وکیل معتبر نیست.',
    )
  }


  const page =
    params.page ??
    1


  const limit =
    params.limit ??
    10


  const response =
    await apiRequest<
      BackendHistoryResponse
    >(
      `${
        API_ENDPOINTS
          .lawyerSubscriptions(
            id,
          )
      }${
        buildQuery({
          page,
          limit,
        })
      }`,
    )


  if (
    response.success !==
    true
  ) {
    throw new Error(
      response.message ||
      'دریافت تاریخچه اشتراک وکیل ناموفق بود.',
    )
  }


  if (
    !Array.isArray(
      response.data,
    )
  ) {
    throw new Error(
      'ساختار تاریخچه اشتراک Backend معتبر نیست.',
    )
  }


  return {
    items:
      response.data.map(
        mapSubscription,
      ),

    pagination:
      normalizePagination(
        response.pagination,
        page,
        limit,
      ),
  }
}


export async function activateLawyerSubscription(
  lawyerId:
    string,

  planId:
    string,
): Promise<LawyerSubscription> {
  const normalizedLawyerId =
    lawyerId.trim()


  const normalizedPlanId =
    planId.trim()


  if (
    !normalizedLawyerId
  ) {
    throw new Error(
      'شناسه وکیل معتبر نیست.',
    )
  }


  if (
    !normalizedPlanId
  ) {
    throw new Error(
      'یک پلن اشتراکی انتخاب کنید.',
    )
  }


  const response =
    await apiRequest<
      BackendSubscriptionResponse
    >(
      API_ENDPOINTS
        .lawyerSubscriptions(
          normalizedLawyerId,
        ),

      {
        method:
          'POST',

        body:
          JSON.stringify({
            planId:
              normalizedPlanId,
          }),
      },
    )


  if (
    response.success !==
    true
  ) {
    throw new Error(
      response.message ||
      'فعال‌سازی اشتراک وکیل ناموفق بود.',
    )
  }


  return mapSubscription(
    response.data,
  )
}


export async function cancelCurrentLawyerSubscription(
  lawyerId:
    string,
): Promise<LawyerSubscription> {
  const id =
    lawyerId.trim()


  if (
    !id
  ) {
    throw new Error(
      'شناسه وکیل معتبر نیست.',
    )
  }


  const response =
    await apiRequest<
      BackendSubscriptionResponse
    >(
      API_ENDPOINTS
        .lawyerCurrentSubscriptionCancel(
          id,
        ),

      {
        method:
          'PATCH',
      },
    )


  if (
    response.success !==
    true
  ) {
    throw new Error(
      response.message ||
      'لغو اشتراک فعال وکیل ناموفق بود.',
    )
  }


  return mapSubscription(
    response.data,
  )
}