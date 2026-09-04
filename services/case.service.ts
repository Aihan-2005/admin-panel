import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import { normalizeList } from '@/lib/api/normalize'

import type { LegalCase } from '@/types/case'

export async function getCases(
  search?: string,
): Promise<LegalCase[]> {
  const payload =
    await apiRequest<unknown>(
      `${
        API_ENDPOINTS.cases
      }${buildQuery({
        search,
      })}`,
    )

  return normalizeList<LegalCase>(
    payload,
  )
}