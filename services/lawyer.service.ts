import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

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
}

interface BackendLawyerListItem {
  id: string

  firstName: string
  lastName: string

  email: string | null
  phone: string | null

  licenseNumber: string

  specialization: string

  accountStatus:
    AccountStatus

  lawyerStatus:
    LawyerState

  createdAt:
    | string
    | null
}

interface BackendLawyerDetail {
  id: string

  firstName: string
  lastName: string

  email: string | null

  accountStatus:
    AccountStatus

  lawyerStatus:
    LawyerState

  profile: {
    phone: string

    specialization: string

    licenseNumber: string
  }

  createdAt:
    | string
    | null
}

interface Pagination {
  page: number

  limit: number

  total: number

  totalPages: number
}

interface LawyerListResponse {
  success: boolean

  data:
    BackendLawyerListItem[]

  pagination: Pagination
}

interface LawyerResponse {
  success: boolean

  data:
    BackendLawyerDetail
}

function mapListLawyer(
  item: BackendLawyerListItem,
): Lawyer {
  return {
    id: item.id,

    fullName: [
      item.firstName,
      item.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),

    phone:
      item.phone ?? '',

    email:
      item.email ?? '',

    specialization:
      item.specialization,

    licenseNumber:
      item.licenseNumber,

    state:
      item.lawyerStatus,

    accountStatus:
      item.accountStatus,

    createdAt:
      item.createdAt ?? '',
  }
}

function mapDetailLawyer(
  item: BackendLawyerDetail,
): Lawyer {
  return {
    id: item.id,

    fullName: [
      item.firstName,
      item.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),

    phone:
      item.profile
        ?.phone ?? '',

    email:
      item.email ?? '',

    specialization:
      item.profile
        ?.specialization ??
      '',

    licenseNumber:
      item.profile
        ?.licenseNumber ??
      '',

    state:
      item.lawyerStatus,

    accountStatus:
      item.accountStatus,

    createdAt:
      item.createdAt ?? '',
  }
}

async function getLawyerPage(
  params: LawyerListParams,
  page: number,
) {
  return apiRequest<LawyerListResponse>(
    `${
      API_ENDPOINTS.lawyers
    }${buildQuery({
      search:
        params.search,

      lawyerStatus:
        params.state,

      page,

      limit: 100,
    })}`,
  )
}



async function fetchAllLawyers(
  params: LawyerListParams,
) {
  const first =
    await getLawyerPage(
      params,
      1,
    )

  const totalPages =
    first.pagination
      ?.totalPages ?? 1

  if (totalPages <= 1) {
    return first.data
  }

  const otherPages =
    await Promise.all(
      Array.from(
        {
          length:
            totalPages - 1,
        },
        (_, index) =>
          getLawyerPage(
            params,
            index + 2,
          ),
      ),
    )

  return [
    ...first.data,

    ...otherPages.flatMap(
      (result) =>
        result.data,
    ),
  ]
}

function sortLawyers(
  lawyers: Lawyer[],
  params: LawyerListParams,
) {
  const sortBy =
    params.sortBy

  if (!sortBy) {
    return lawyers
  }

  const direction =
    params.sortOrder ===
    'desc'
      ? -1
      : 1

  return [...lawyers].sort(
    (a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'fullName':
          comparison =
            a.fullName.localeCompare(
              b.fullName,
              'fa-IR',
            )
          break

        case 'state':
          comparison =
            a.state.localeCompare(
              b.state,
            )
          break

        case 'createdAt':
          comparison =
            new Date(
              a.createdAt,
            ).getTime() -
            new Date(
              b.createdAt,
            ).getTime()
          break
      }

      return (
        comparison *
        direction
      )
    },
  )
}

export async function getLawyers(
  params: LawyerListParams = {},
): Promise<Lawyer[]> {
  const raw =
    await fetchAllLawyers(
      params,
    )

  const lawyers =
    raw.map(
      mapListLawyer,
    )

  return sortLawyers(
    lawyers,
    params,
  )
}

export async function getLawyer(
  id: string,
): Promise<Lawyer> {
  const response =
    await apiRequest<LawyerResponse>(
      API_ENDPOINTS.lawyer(
        id,
      ),
    )

  return mapDetailLawyer(
    response.data,
  )
}

export async function updateLawyerState(
  id: string,
  state: LawyerState,
): Promise<Lawyer> {

  
  await apiRequest(
    API_ENDPOINTS.lawyerStatus(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        status: state,
      }),
    },
  )

  return getLawyer(id)
}

export async function updateLawyerAccountStatus(
  id: string,
  accountStatus: AccountStatus,
): Promise<Lawyer> {
  await apiRequest(
    API_ENDPOINTS.lawyerAccountStatus(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        status:
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
  await apiRequest(
    API_ENDPOINTS.lawyerPassword(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        newPassword:
          payload.password,
      }),
    },
  )
}