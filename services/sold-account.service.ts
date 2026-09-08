import type { SoldAccount } from '@/types/sold-account'



export async function getSoldAccounts(
  _search?: string,
): Promise<SoldAccount[]> {
  throw new Error(
    'بخش حساب‌های فروخته‌شده هنوز توسط API پنل مدیریت پشتیبانی نمی‌شود.',
  )
}