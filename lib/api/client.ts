const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
).replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined

export function buildQuery(
  params: Record<string, QueryValue>,
): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'NEXT_PUBLIC_API_BASE_URL تنظیم نشده است. آدرس بک‌اند را در فایل .env.local قرار دهید.',
      0,
    )
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,

      credentials: 'include',

      headers: {
        Accept: 'application/json',

        ...(init.body
          ? {
              'Content-Type': 'application/json',
            }
          : {}),

        ...init.headers,
      },
    },
  )

  if (response.status === 204) {
    return undefined as T
  }

  const contentType =
    response.headers.get('content-type') ?? ''

  const payload = contentType.includes(
    'application/json',
  )
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload &&
      'message' in payload
        ? String(
            (
              payload as {
                message?: unknown
              }
            ).message ?? 'خطای نامشخص',
          )
        : `درخواست با خطای ${response.status} مواجه شد.`

    throw new ApiError(
      message,
      response.status,
      payload,
    )
  }

  return payload as T
}