import type { AccountStatus } from '@/types/common'

export interface Client {
  id: string
  fullName: string
  phone: string
  email: string
  accountStatus: AccountStatus
  createdAt: string
}