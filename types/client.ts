export type ClientAccountStatus = 'ACTIVE' | 'SUSPENDED'

export interface Client {
  id: string
  fullName: string
  phone: string
  email: string
  accountStatus: ClientAccountStatus
  createdAt: string
}

export const CLIENT_ACCOUNT_STATUS_LABELS: Record<
  ClientAccountStatus,
  string
> = {
  ACTIVE: 'فعال',
  SUSPENDED: 'مسدود',
}