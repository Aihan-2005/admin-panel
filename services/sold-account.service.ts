import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import { normalizeList } from '@/lib/api/normalize'

import type { SoldAccount } from '@/types/sold-account'

export async function getSoldAccounts(
  search?: string,
): Promise<SoldAccount[]> {
  const payload =
    await apiRequest<unknown>(
      `${
        API_ENDPOINTS.soldAccounts
      }${buildQuery({
        search,
      })}`,
    )

  return normalizeList<SoldAccount>(
    payload,
  )
}