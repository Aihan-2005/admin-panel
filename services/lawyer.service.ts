import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import {
  normalizeEntity,
  normalizeList,
} from '@/lib/api/normalize'

import type {
  AccountStatus,
  SortDirection,
} from '@/types/common'

import type {
  Lawyer,
  LawyerState,
} from '@/types/lawyer'

export interface LawyerListParams {
  search?: string

  state?: LawyerState

  sortBy?:
    | 'fullName'
    | 'state'
    | 'createdAt'

  sortOrder?: SortDirection
}

export interface UpdateLawyerPasswordPayload {
  password: string

  forceChangeOnNextLogin?: boolean
}

export async function getLawyers(
  params: LawyerListParams = {},
): Promise<Lawyer[]> {
  const payload =
    await apiRequest<unknown>(
      `${
        API_ENDPOINTS.lawyers
      }${buildQuery({
        search:
          params.search,

        state:
          params.state,

        sortBy:
          params.sortBy,

        sortOrder:
          params.sortOrder,
      })}`,
    )

  return normalizeList<Lawyer>(
    payload,
  )
}

export async function getLawyer(
  id: string,
): Promise<Lawyer> {
  const payload =
    await apiRequest<unknown>(
      API_ENDPOINTS.lawyer(
        id,
      ),
    )

  return normalizeEntity<Lawyer>(
    payload,
  )
}

export async function updateLawyerState(
  id: string,
  state: LawyerState,
): Promise<Lawyer> {
  await apiRequest<unknown>(
    API_ENDPOINTS.lawyerState(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        state,
      }),
    },
  )

  return getLawyer(id)
}

export async function updateLawyerAccountStatus(
  id: string,
  accountStatus: AccountStatus,
): Promise<Lawyer> {
  await apiRequest<unknown>(
    API_ENDPOINTS.lawyerAccountStatus(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        accountStatus,
      }),
    },
  )

  return getLawyer(id)
}

export async function updateLawyerPassword(
  id: string,
  payload: UpdateLawyerPasswordPayload,
): Promise<void> {
  await apiRequest<void>(
    API_ENDPOINTS.lawyerPassword(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify(
        payload,
      ),
    },
  )
}