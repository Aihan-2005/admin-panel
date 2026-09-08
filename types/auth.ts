import type {
  AccountStatus,
} from '@/types/common'

export type UserRole =
  | 'LAWYER'
  | 'CLIENT'
  | 'ADMIN'

export interface VerificationState {
  verified: boolean
  verifiedAt: string | null
}

export interface AdminUser {
  id: string

  email: string | null

  phone: string | null

  role: 'ADMIN'

  status: AccountStatus

  verification: {
    email: VerificationState
    phone: VerificationState
  }

  lastLoginAt:
    | string
    | null


    
  fullName?: string | null

  username?: string | null
}

export interface AdminLoginPayload {

  
  identifier: string

  password: string
}