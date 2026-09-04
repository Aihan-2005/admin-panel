import type { Lawyer, LawyerState } from '@/types/lawyer'

const FIRST_NAMES = [
  'علی', 'محمد', 'زهرا', 'فاطمه', 'حسین', 'مریم', 'رضا', 'سارا',
  'امیر', 'نگار', 'حسن', 'الهام', 'کیوان', 'شیدا', 'بهرام',
]

const LAST_NAMES = [
  'محمدی', 'حسینی', 'کریمی', 'رضایی', 'موسوی', 'صادقی', 'نوری',
  'جعفری', 'قاسمی', 'رحیمی', 'عباسی', 'یوسفی',
]

const SPECIALIZATIONS = [
  'حقوق کیفری', 'حقوق خانواده', 'حقوق تجارت', 'حقوق ملکی',
  'حقوق کار', 'حقوق بین‌الملل',
]

const STATES: LawyerState[] = [
  'PENDING_VERIFICATION',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
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

function generateLawyer(index: number): Lawyer {
  const firstName = randomItem(FIRST_NAMES)
  const lastName = randomItem(LAST_NAMES)
  const state = randomItem(STATES)

  return {
    id: `lawyer-${index}`,
    fullName: `${firstName} ${lastName}`,
    phone: randomPhone(),
    email: `lawyer${index}@example.com`,
    specialization: randomItem(SPECIALIZATIONS),
    licenseNumber: String(10000 + index),
    state,
    accountStatus: state === 'SUSPENDED' && Math.random() > 0.7 ? 'SUSPENDED' : 'ACTIVE',
    createdAt: randomDate(),
  }
}

export const MOCK_LAWYERS: Lawyer[] = Array.from(
  { length: 28 },
  (_, index) => generateLawyer(index + 1),
)