import { MOCK_LAWYERS } from '@/lib/mock/lawyers.mock'
import type { Lawyer } from '@/types/lawyer'

export async function getLawyers(): Promise<Lawyer[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_LAWYERS
}