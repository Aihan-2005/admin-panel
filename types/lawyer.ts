import type { AccountStatus } from '@/types/common'

export type LawyerState =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED'

export interface Lawyer {
  id: string
  fullName: string
  phone: string
  email: string
  specialization?: string | null
  licenseNumber?: string | null
  state: LawyerState
  accountStatus: AccountStatus
  createdAt: string
}

export const LAWYER_STATE_LABELS: Record<LawyerState, string> = {
  PENDING_VERIFICATION: 'در انتظار احراز',
  ACTIVE: 'فعال',
  SUSPENDED: 'معلق',
  REJECTED: 'رد شده',
}