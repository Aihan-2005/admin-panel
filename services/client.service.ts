import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import {
  normalizeEntity,
  normalizeList,
} from '@/lib/api/normalize'

import type { Client } from '@/types/client'

import type {
  AccountStatus,
  SortDirection,
} from '@/types/common'

export interface ClientListParams {
  search?: string

  accountStatus?: AccountStatus

  sortBy?:
    | 'fullName'
    | 'createdAt'

  sortOrder?: SortDirection
}

export async function getClients(
  params: ClientListParams = {},
): Promise<Client[]> {
  const payload =
    await apiRequest<unknown>(
      `${
        API_ENDPOINTS.clients
      }${buildQuery({
        search: params.search,

        accountStatus:
          params.accountStatus,

        sortBy: params.sortBy,

        sortOrder:
          params.sortOrder,
      })}`,
    )

  return normalizeList<Client>(
    payload,
  )
}

export async function getClient(
  id: string,
): Promise<Client> {
  const payload =
    await apiRequest<unknown>(
      API_ENDPOINTS.client(id),
    )

  return normalizeEntity<Client>(
    payload,
  )
}

export async function updateClientAccountStatus(
  id: string,
  accountStatus: AccountStatus,
): Promise<Client> {
  await apiRequest<unknown>(
    API_ENDPOINTS.clientAccountStatus(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        accountStatus,
      }),
    },
  )

  return getClient(id)
}