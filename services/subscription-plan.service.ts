import {
  apiRequest,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  SubscriptionFeatureOption,
  SubscriptionPlan,
  SubscriptionPlanOptions,
  SubscriptionPlanPayload,
  UpdateSubscriptionPlanPayload,
} from '@/types/subscription-plan'


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


interface BackendSubscriptionPlan {
  _id?:
    unknown

  id?:
    unknown

  title?:
    unknown

  description?:
    unknown

  tier?:
    unknown

  tags?:
    unknown

  durationMonths?:
    unknown

  price?:
    unknown

  discountPercent?:
    unknown

  features?:
    unknown

  isActive?:
    unknown

  sortOrder?:
    unknown

  createdAt?:
    unknown

  updatedAt?:
    unknown
}


interface BackendSubscriptionOptions {
  tiers?:
    unknown

  features?:
    unknown
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


function toStringValue(
  value:
    unknown,
): string {
  return typeof value ===
    'string'
    ? value
    : ''
}


function toOptionalString(
  value:
    unknown,
): string | undefined {
  return typeof value ===
      'string' &&
    value.trim()
    ? value
    : undefined
}


function toNumberValue(
  value:
    unknown,

  fallback =
    0,
): number {
  return typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
    ? value
    : fallback
}


function toStringArray(
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


function resolveId(
  item:
    BackendSubscriptionPlan,
): string {
  if (
    typeof item.id ===
      'string' &&
    item.id
  ) {
    return item.id
  }


  if (
    typeof item._id ===
      'string'
  ) {
    return item._id
  }


  if (
    item._id !==
      undefined &&
    item._id !==
      null
  ) {
    return String(
      item._id,
    )
  }


  return ''
}


function mapSubscriptionPlan(
  item:
    BackendSubscriptionPlan,
): SubscriptionPlan {
  return {
    id:
      resolveId(
        item,
      ),

    title:
      toStringValue(
        item.title,
      ),

    description:
      toStringValue(
        item.description,
      ),

    tier:
      toStringValue(
        item.tier,
      ),

    tags:
      toStringArray(
        item.tags,
      ),

    durationMonths:
      toNumberValue(
        item.durationMonths,
      ),

    price:
      toNumberValue(
        item.price,
      ),

    discountPercent:
      toNumberValue(
        item.discountPercent,
      ),

    features:
      toStringArray(
        item.features,
      ),

    isActive:
      item.isActive ===
      true,

    sortOrder:
      toNumberValue(
        item.sortOrder,
      ),

    createdAt:
      toOptionalString(
        item.createdAt,
      ),

    updatedAt:
      toOptionalString(
        item.updatedAt,
      ),
  }
}


function normalizeFeature(
  value:
    unknown,
): SubscriptionFeatureOption | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null
  }


  const code =
    toStringValue(
      value.code,
    )
      .trim()


  const title =
    toStringValue(
      value.title,
    )
      .trim()


  const description =
    toStringValue(
      value.description,
    )
      .trim()


  if (
    !code
  ) {
    return null
  }


  return {
    code,

    title:
      title ||
      code,

    description,
  }
}


function normalizeOptions(
  value:
    BackendSubscriptionOptions,
): SubscriptionPlanOptions {
  const tiers =
    toStringArray(
      value.tiers,
    )


  const features =
    Array.isArray(
      value.features,
    )
      ? value.features
          .map(
            normalizeFeature,
          )
          .filter(
            (
              item,
            ): item is SubscriptionFeatureOption =>
              item !==
              null,
          )
      : []


  if (
    tiers.length ===
    0
  ) {
    throw new Error(
      'Backend هیچ tier معتبری برای پلن‌های اشتراکی برنگرداند.',
    )
  }


  if (
    features.length ===
    0
  ) {
    throw new Error(
      'Backend هیچ feature معتبری برای پلن‌های اشتراکی برنگرداند.',
    )
  }


  return {
    tiers:
      Array.from(
        new Set(
          tiers,
        ),
      ),

    features:
      Array.from(
        new Map(
          features.map(
            (
              item,
            ) => [
              item.code,
              item,
            ],
          ),
        ).values(),
      ),
  }
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


export async function getSubscriptionPlanOptions():
  Promise<SubscriptionPlanOptions> {
  const response =
    await apiRequest<
      ApiEnvelope<BackendSubscriptionOptions>
    >(
      API_ENDPOINTS
        .subscriptionPlanOptions,
    )


  const data =
    assertSuccess(
      response,
      'دریافت تنظیمات پلن‌ها ناموفق بود.',
    )


  return normalizeOptions(
    data,
  )
}


export async function getAdminSubscriptionPlans():
  Promise<SubscriptionPlan[]> {
  const response =
    await apiRequest<
      ApiEnvelope<
        BackendSubscriptionPlan[]
      >
    >(
      API_ENDPOINTS
        .subscriptionPlans,
    )


  const data =
    assertSuccess(
      response,
      'دریافت پلن‌های اشتراکی ناموفق بود.',
    )


  if (
    !Array.isArray(
      data,
    )
  ) {
    throw new Error(
      'ساختار پاسخ لیست پلن‌های اشتراکی معتبر نیست.',
    )
  }


  return data
    .map(
      mapSubscriptionPlan,
    )
    .filter(
      (
        item,
      ) =>
        Boolean(
          item.id,
        ),
    )
}


export async function createSubscriptionPlan(
  input:
    SubscriptionPlanPayload,
): Promise<SubscriptionPlan> {
  const response =
    await apiRequest<
      ApiEnvelope<BackendSubscriptionPlan>
    >(
      API_ENDPOINTS
        .subscriptionPlans,

      {
        method:
          'POST',

        body:
          JSON.stringify(
            input,
          ),
      },
    )


  const data =
    assertSuccess(
      response,
      'ساخت پلن اشتراکی ناموفق بود.',
    )


  return mapSubscriptionPlan(
    data,
  )
}


export async function updateSubscriptionPlan(
  id:
    string,

  input:
    UpdateSubscriptionPlanPayload,
): Promise<SubscriptionPlan> {
  const normalizedId =
    id.trim()


  if (
    !normalizedId
  ) {
    throw new Error(
      'شناسه پلن اشتراکی معتبر نیست.',
    )
  }


  const response =
    await apiRequest<
      ApiEnvelope<BackendSubscriptionPlan>
    >(
      API_ENDPOINTS
        .subscriptionPlan(
          normalizedId,
        ),

      {
        method:
          'PATCH',

        body:
          JSON.stringify(
            input,
          ),
      },
    )


  const data =
    assertSuccess(
      response,
      'ویرایش پلن اشتراکی ناموفق بود.',
    )


  return mapSubscriptionPlan(
    data,
  )
}