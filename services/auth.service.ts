import {
  ApiError,
  apiRequest,
  clearAccessToken,
  setAccessToken,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type {
  AdminLoginPayload,
  AdminUser,
  UserRole,
  VerificationState,
} from '@/types/auth'

import type {
  AccountStatus,
} from '@/types/common'

interface BackendUser {
  id: string

  email: string | null

  phone: string | null

  role: UserRole

  status: AccountStatus

  verification: {
    email: VerificationState
    phone: VerificationState
  }

  lastLoginAt:
    | string
    | null
}

interface LoginResponse {
  success: boolean

  data: {
    user: BackendUser

    accessToken: string

    accessTokenExpiresIn: number
  }
}

interface MeResponse {
  success: boolean

  data: {
    user: BackendUser
  }
}

function mapAdminUser(
  user: BackendUser,
): AdminUser {
  if (
    user.role !== 'ADMIN'
  ) {
    throw new ApiError(
      'این حساب دسترسی مدیریت ندارد.',
      403,
      user,
    )
  }

  return {
    id: user.id,

    email: user.email,

    phone: user.phone,

    role: 'ADMIN',

    status: user.status,

    verification:
      user.verification,

    lastLoginAt:
      user.lastLoginAt,

    fullName:
      'مدیر دادیار',

    username: null,
  }
}

async function clearBackendSession() {
  try {
    await apiRequest(
      API_ENDPOINTS.authLogout,
      {
        method: 'POST',
      },
      {
        auth: false,
        retryOnUnauthorized:
          false,
      },
    )
  } catch {
  }

  clearAccessToken()
}

export async function loginAdmin(
  payload: AdminLoginPayload,
): Promise<AdminUser> {
  const identifier =
    payload.identifier.trim()


    
  const credentials =
    identifier.includes('@')
      ? {
          email:
            identifier.toLowerCase(),

          password:
            payload.password,
        }
      : {
          phone:
            identifier,

          password:
            payload.password,
        }

  const response =
    await apiRequest<LoginResponse>(
      API_ENDPOINTS.authLogin,
      {
        method: 'POST',

        body: JSON.stringify(
          credentials,
        ),

        cache: 'no-store',
      },
      {
        auth: false,

        retryOnUnauthorized:
          false,
      },
    )

  const token =
    response.data
      ?.accessToken

  const user =
    response.data?.user

  if (!token || !user) {
    throw new ApiError(
      'پاسخ ورود از سرور معتبر نیست.',
      500,
      response,
    )
  }

  setAccessToken(token)

  try {
    return mapAdminUser(
      user,
    )
  } catch (error) {

    
    await clearBackendSession()

    throw error
  }
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const response =
    await apiRequest<MeResponse>(
      API_ENDPOINTS.authMe,
      {
        method: 'GET',

        cache: 'no-store',
      },
    )

  return mapAdminUser(
    response.data.user,
  )
}

export async function logoutAdmin(): Promise<void> {
  clearAccessToken()

  await apiRequest(
    API_ENDPOINTS.authLogout,
    {
      method: 'POST',

      cache: 'no-store',
    },
    {
      auth: false,

      retryOnUnauthorized:
        false,
    },
  )
}