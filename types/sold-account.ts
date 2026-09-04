export interface SoldAccount {
  id: string

  buyerFullName: string

  phone?: string | null

  email?: string | null

  accountType?: string | null

  packageTitle?: string | null

  amount?: number | null

  soldAt: string

  expiresAt?: string | null

  status?: string | null
}