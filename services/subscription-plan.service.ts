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
  SubscriptionSettings,
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
 
  durationDays?:
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


interface BackendSubscriptionSettings {
  trialDays?:
    unknown
}


const FEATURE_TRANSLATIONS:
  Record<
    string,
    {
      title:
        string

      description:
        string
    }
  > = {
    CASE_MANAGEMENT: {
      title:
        'مدیریت پرونده‌ها',

      description:
        'دسترسی به بخش مدیریت پرونده‌های وکیل.',
    },

    FINANCIAL_REPORTS: {
      title:
        'گزارش‌های مالی',

      description:
        'دسترسی به گزارش‌ها و نمای کلی مالی.',
    },

    SCHEDULING: {
      title:
        'زمان‌بندی و رزرو',

      description:
        'دسترسی به مدیریت زمان‌های آزاد و برنامه‌ریزی قرارها.',
    },

    ONLINE_MEETINGS: {
      title:
        'جلسات آنلاین',

      description:
        'امکان ایجاد و مدیریت جلسات آنلاین.',
    },

    CLIENT_DIRECTORY_VISIBILITY: {
      title:
        'نمایش در فهرست وکلا',

      description:
        'امکان نمایش وکیل در جستجو و فهرست وکلای بخش موکلین.',
    },
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
  const normalized =
    toStringValue(
      value,
    ).trim()

  return normalized ||
    undefined
}


function toNumberValue(
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


function toPositiveInteger(
  value:
    unknown,

  fallback:
    number,
): number {
  const numeric =
    toNumberValue(
      value,
      fallback,
    )

  if (
    !Number.isFinite(
      numeric,
    ) ||
    numeric <=
      0
  ) {
    return fallback
  }

  return Math.max(
    1,
    Math.round(
      numeric,
    ),
  )
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

  return Array.from(
    new Set(
      value
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
        ),
    ),
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


function resolveDurationDays(
  item:
    BackendSubscriptionPlan,
): number {
  const explicitDays =
    toNumberValue(
      item.durationDays,
      0,
    )

  if (
    explicitDays >
    0
  ) {
    return Math.round(
      explicitDays,
    )
  }

  const legacyMonths =
    toNumberValue(
      item.durationMonths,
      0,
    )

  if (
    legacyMonths >
    0
  ) {
    return Math.round(
      legacyMonths *
        30,
    )
  }

  return 30
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

    durationDays:
      resolveDurationDays(
        item,
      ),

    price:
      Math.max(
        0,
        Math.round(
          toNumberValue(
            item.price,
          ),
        ),
      ),

    discountPercent:
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            toNumberValue(
              item.discountPercent,
            ),
          ),
        ),
      ),

    features:
      toStringArray(
        item.features,
      ),

    isActive:
      item.isActive ===
      true,

    sortOrder:
      Math.max(
        0,
        Math.round(
          toNumberValue(
            item.sortOrder,
          ),
        ),
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
    ).trim()

  if (
    !code
  ) {
    return null
  }

  const translation =
    FEATURE_TRANSLATIONS[
      code
    ]

  if (
    translation
  ) {
    return {
      code,

      title:
        translation.title,

      description:
        translation.description,
    }
  }

  const backendTitle =
    toStringValue(
      value.title,
    ).trim()

  const backendDescription =
    toStringValue(
      value.description,
    ).trim()

  return {
    code,

    title:
      backendTitle ||
      code,

    description:
      backendDescription,
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
      'هیچ سطح اشتراکی معتبری دریافت نشد.',
    )
  }

  if (
    features.length ===
    0
  ) {
    throw new Error(
      'هیچ قابلیت معتبری برای پلن‌ها دریافت نشد.',
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


 
function toBackendPlanPayload(
  input:
    SubscriptionPlanPayload |
    UpdateSubscriptionPlanPayload,
): Record<
  string,
  unknown
> {
  const {
    durationDays,
    ...rest
  } =
    input

  const result:
    Record<
      string,
      unknown
    > = {
      ...rest,
    }

  if (
    durationDays ===
    undefined
  ) {
    return result
  }

  if (
    durationDays %
      30 ===
    0
  ) {
    result.durationMonths =
      durationDays /
      30
  } else {
    result.durationDays =
      durationDays
  }

  return result
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

  return normalizeOptions(
    assertSuccess(
      response,
      'دریافت تنظیمات پلن‌ها ناموفق بود.',
    ),
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
      'ساختار پاسخ لیست پلن‌ها معتبر نیست.',
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
            toBackendPlanPayload(
              input,
            ),
          ),
      },
    )

  return mapSubscriptionPlan(
    assertSuccess(
      response,
      'ساخت پلن اشتراکی ناموفق بود.',
    ),
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
      'شناسه پلن معتبر نیست.',
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
            toBackendPlanPayload(
              input,
            ),
          ),
      },
    )

  return mapSubscriptionPlan(
    assertSuccess(
      response,
      'ویرایش پلن اشتراکی ناموفق بود.',
    ),
  )
}


export async function getSubscriptionSettings():
  Promise<SubscriptionSettings> {
  const response =
    await apiRequest<
      ApiEnvelope<BackendSubscriptionSettings>
    >(
      API_ENDPOINTS
        .subscriptionSettings,
    )

  const data =
    assertSuccess(
      response,
      'دریافت تنظیمات دوره رایگان ناموفق بود.',
    )

  return {
    trialDays:
      toPositiveInteger(
        data.trialDays,
        14,
      ),
  }
}


export async function updateSubscriptionSettings(
  trialDays:
    number,
): Promise<SubscriptionSettings> {
  if (
    !Number.isInteger(
      trialDays,
    ) ||
    trialDays <
      1 ||
    trialDays >
      365
  ) {
    throw new Error(
      'تعداد روزهای دوره رایگان باید بین ۱ تا ۳۶۵ روز باشد.',
    )
  }

  const response =
    await apiRequest<
      ApiEnvelope<BackendSubscriptionSettings>
    >(
      API_ENDPOINTS
        .subscriptionSettings,

      {
        method:
          'PATCH',

        body:
          JSON.stringify({
            trialDays,
          }),
      },
    )

  const data =
    assertSuccess(
      response,
      'ذخیره تنظیمات دوره رایگان ناموفق بود.',
    )

  return {
    trialDays:
      toPositiveInteger(
        data.trialDays,
        trialDays,
      ),
  }
}
