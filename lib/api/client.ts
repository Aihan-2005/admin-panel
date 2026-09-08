import { API_ENDPOINTS } from '@/lib/api/endpoints'

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
).replace(/\/+$/, '')

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

interface ApiRequestOptions {
  /**
   * آیا درخواست Authorization نیاز دارد؟
   *
   * به صورت پیش‌فرض true است.
   */
  auth?: boolean

  /**
   * در صورت 401 یک بار refresh انجام شود.
   */
  retryOnUnauthorized?: boolean
}

let accessToken: string | null = null

let refreshPromise:
  | Promise<string>
  | null = null

function ensureBaseUrl() {
  if (!API_BASE_URL) {
    throw new ApiError(
      'NEXT_PUBLIC_API_BASE_URL تنظیم نشده است.',
      0,
    )
  }
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === 'object' &&
    value !== null
  )
}

async function parseResponsePayload(
  response: Response,
): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType =
    response.headers.get(
      'content-type',
    ) ?? ''

  if (
    contentType.includes(
      'application/json',
    )
  ) {
    return response
      .json()
      .catch(() => null)
  }

  return response
    .text()
    .catch(() => null)
}

function getErrorMessage(
  payload: unknown,
  status: number,
) {
  if (
    isRecord(payload) &&
    typeof payload.message ===
      'string' &&
    payload.message
  ) {
    return payload.message
  }

  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.message ===
      'string'
  ) {
    return payload.error.message
  }

  return `درخواست با خطای ${status} مواجه شد.`
}

async function safeFetch(
  url: string,
  init: RequestInit,
) {
  try {
    return await fetch(
      url,
      init,
    )
  } catch (error) {
    throw new ApiError(
      'ارتباط با سرور برقرار نشد. اتصال اینترنت و آدرس API را بررسی کنید.',
      0,
      error,
    )
  }
}

function buildHeaders(
  init: RequestInit,
  token?: string | null,
) {
  const headers =
    new Headers(
      init.headers,
    )

  if (
    !headers.has('Accept')
  ) {
    headers.set(
      'Accept',
      'application/json',
    )
  }

  const isFormData =
    typeof FormData !==
      'undefined' &&
    init.body instanceof
      FormData

  if (
    init.body != null &&
    !isFormData &&
    !headers.has(
      'Content-Type',
    )
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  return headers
}

export function setAccessToken(
  token: string | null,
) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export function getAccessToken() {
  return accessToken
}

async function performRefresh(): Promise<string> {
  ensureBaseUrl()

  const response =
    await safeFetch(
      `${API_BASE_URL}${API_ENDPOINTS.authRefresh}`,
      {
        method: 'POST',

        credentials:
          'include',

        cache: 'no-store',

        headers: {
          Accept:
            'application/json',
        },
      },
    )

  const payload =
    await parseResponsePayload(
      response,
    )

  if (!response.ok) {
    clearAccessToken()

    throw new ApiError(
      getErrorMessage(
        payload,
        response.status,
      ),
      response.status,
      payload,
    )
  }

  const data =
    isRecord(payload) &&
    isRecord(payload.data)
      ? payload.data
      : null

  const token =
    data &&
    typeof data.accessToken ===
      'string'
      ? data.accessToken
      : null

  if (!token) {
    clearAccessToken()

    throw new ApiError(
      'سرور access token معتبر برنگرداند.',
      500,
      payload,
    )
  }

  setAccessToken(token)

  return token
}

/**
 * چند request همزمان اگر token نداشته باشند،
 * فقط یک refresh request ارسال می‌شود.
 */
export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise =
      performRefresh().finally(
        () => {
          refreshPromise =
            null
        },
      )
  }

  return refreshPromise
}

export function buildQuery(
  params: Record<
    string,
    QueryValue
  >,
): string {
  const searchParams =
    new URLSearchParams()

  Object.entries(
    params,
  ).forEach(
    ([key, value]) => {
      if (
        value !==
          undefined &&
        value !== null &&
        value !== ''
      ) {
        searchParams.set(
          key,
          String(value),
        )
      }
    },
  )

  const query =
    searchParams.toString()

  return query
    ? `?${query}`
    : ''
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  ensureBaseUrl()

  const shouldAuthenticate =
    options.auth ?? true

  const retryOnUnauthorized =
    options.retryOnUnauthorized ??
    true

  let token =
    shouldAuthenticate
      ? accessToken
      : null

  /**
   * بعد از refresh صفحه،
   * access token داخل memory نیست.
   *
   * refresh cookie اما HttpOnly
   * و در Browser موجود است.
   */
  if (
    shouldAuthenticate &&
    !token
  ) {
    token =
      await refreshAccessToken()
  }

  const execute = (
    currentToken:
      | string
      | null,
  ) =>
    safeFetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,

        credentials:
          'include',

        headers:
          buildHeaders(
            init,
            currentToken,
          ),
      },
    )

  let response =
    await execute(token)

  /**
   * access token ممکن است expire
   * شده باشد.
   *
   * فقط یک بار refresh + retry.
   */
  if (
    response.status ===
      401 &&
    shouldAuthenticate &&
    retryOnUnauthorized
  ) {
    clearAccessToken()

    token =
      await refreshAccessToken()

    response =
      await execute(token)
  }

  const payload =
    await parseResponsePayload(
      response,
    )

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        payload,
        response.status,
      ),
      response.status,
      payload,
    )
  }

  return payload as T
}
