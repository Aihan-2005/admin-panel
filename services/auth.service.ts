import { apiRequest } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { normalizeEntity } from '@/lib/api/normalize'

import type {
  AdminLoginPayload,
  AdminUser,
} from '@/types/auth'

const USE_MOCK_AUTH =
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'

const MOCK_AUTH_STORAGE_KEY =
  'dadyar_admin_mock_session'

const MOCK_ADMIN: AdminUser = {
  id: 'mock-admin-1',

  fullName: 'مدیر دادیار',

  email: 'admin@dadyar.local',

  username: 'admin',

  role: 'ADMIN',
}



function saveMockSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    MOCK_AUTH_STORAGE_KEY,
    JSON.stringify(MOCK_ADMIN),
  )
}



function getMockSession(): AdminUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value =
    window.localStorage.getItem(
      MOCK_AUTH_STORAGE_KEY,
    )

  if (!value) {
    return null
  }

  try {
    return JSON.parse(
      value,
    ) as AdminUser
  } catch {
    window.localStorage.removeItem(
      MOCK_AUTH_STORAGE_KEY,
    )

    return null
  }
}


function removeMockSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(
    MOCK_AUTH_STORAGE_KEY,
  )
}



export async function loginAdmin(
  payload: AdminLoginPayload,
): Promise<AdminUser> {

    
  if (USE_MOCK_AUTH) {
    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          500,
        ),
    )

    const identifier =
      payload.identifier
        .trim()
        .toLowerCase()

    const isValidIdentifier =
      identifier ===
        'admin' ||
      identifier ===
        'admin@dadyar.local'

    const isValidPassword =
      payload.password ===
      '12345678'

    if (
      !isValidIdentifier ||
      !isValidPassword
    ) {
      throw new Error(
        'نام کاربری یا رمز عبور اشتباه است.',
      )
    }

    saveMockSession()

    return MOCK_ADMIN
  }


  
  await apiRequest<unknown>(
    API_ENDPOINTS.adminLogin,
    {
      method: 'POST',

      body: JSON.stringify(
        payload,
      ),
    },
  )

  return getCurrentAdmin()
}


export async function getCurrentAdmin(): Promise<AdminUser> {
 
    
  if (USE_MOCK_AUTH) {
    const admin =
      getMockSession()

    if (!admin) {
      const error =
        new Error(
          'Session وجود ندارد.',
        ) as Error & {
          status?: number
        }

      error.status = 401

      throw error
    }

    return admin
  }

  
  
  const payload =
    await apiRequest<unknown>(
      API_ENDPOINTS.adminMe,
      {
        method: 'GET',

        cache: 'no-store',
      },
    )

  return normalizeEntity<AdminUser>(
    payload,
  )
}



export async function logoutAdmin(): Promise<void> {

    
  if (USE_MOCK_AUTH) {
    removeMockSession()

    return
  }


  
  await apiRequest<void>(
    API_ENDPOINTS.adminLogout,
    {
      method: 'POST',
    },
  )
}