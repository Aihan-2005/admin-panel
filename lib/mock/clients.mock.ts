import type { Client, ClientAccountStatus } from '@/types/client'

const FIRST_NAMES = [
  'علی',
  'محمد',
  'زهرا',
  'فاطمه',
  'حسین',
  'مریم',
  'رضا',
  'سارا',
  'امیر',
  'نگار',
  'حسن',
  'الهام',
  'کیوان',
  'شیدا',
  'بهرام',
]

const LAST_NAMES = [
  'محمدی',
  'حسینی',
  'کریمی',
  'رضایی',
  'موسوی',
  'صادقی',
  'نوری',
  'جعفری',
  'قاسمی',
  'رحیمی',
  'عباسی',
  'یوسفی',
]

const ACCOUNT_STATUSES: ClientAccountStatus[] = [
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'SUSPENDED',
]

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomPhone(): string {
  const suffix = Math.floor(100000000 + Math.random() * 900000000)
  return `09${suffix}`
}

function randomDate(): string {
  const start = new Date(2025, 0, 1).getTime()
  const end = new Date().getTime()

  const timestamp = start + Math.random() * (end - start)

  return new Date(timestamp).toISOString()
}

function generateClient(index: number): Client {
  const firstName = randomItem(FIRST_NAMES)
  const lastName = randomItem(LAST_NAMES)

  return {
    id: `client-${index}`,
    fullName: `${firstName} ${lastName}`,
    phone: randomPhone(),
    email: `client${index}@example.com`,
    accountStatus: randomItem(ACCOUNT_STATUSES),
    createdAt: randomDate(),
  }
}

export const MOCK_CLIENTS: Client[] = Array.from(
  { length: 40 },
  (_, index) => generateClient(index + 1),
)