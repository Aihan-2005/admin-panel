export type LawyerState =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED'

export type AccountStatus = 'ACTIVE' | 'SUSPENDED'

export interface Lawyer {
  id: string
  fullName: string
  phone: string
  email: string
  specialization: string
  licenseNumber: string
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

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'فعال',
  SUSPENDED: 'مسدود',
}