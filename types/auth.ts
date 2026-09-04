export interface AdminUser {
  id: string

  fullName?: string | null

  email?: string | null

  username?: string | null

  role?: string | null
}

export interface AdminLoginPayload {
  identifier: string

  password: string
}