import type { LegalCase } from '@/types/case'



export async function getCases(
  _search?: string,
): Promise<LegalCase[]> {
  throw new Error(
    'بخش پرونده‌ها هنوز توسط API پنل مدیریت پشتیبانی نمی‌شود.',
  )
}