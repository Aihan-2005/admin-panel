export type AccountStatus = 'ACTIVE' | 'SUSPENDED'
export type SortDirection = 'asc' | 'desc'

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'فعال',
  SUSPENDED: 'مسدود',
}