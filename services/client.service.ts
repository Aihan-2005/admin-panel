import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type {
  Client,
} from '@/types/client'

import type {
  AccountStatus,
} from '@/types/common'

interface BackendClient {
  id: string

  email: string | null

  phone: string | null

  accountStatus:
    AccountStatus

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

interface ClientListResponse {
  success: boolean

  data: BackendClient[]

  pagination: Pagination
}

interface ClientResponse {
  success: boolean

  data: BackendClient
}

function getClientDisplayName(
  client: BackendClient,
) {
  return (
    client.phone ||
    client.email ||
    `موکل ${client.id.slice(-6)}`
  )
}

function mapClient(
  client: BackendClient,
): Client {
  return {
    id: client.id,

  
    
    fullName:
      getClientDisplayName(
        client,
      ),

    phone:
      client.phone ?? '',

    email:
      client.email ?? '',

    accountStatus:
      client.accountStatus,

    createdAt:
      client.createdAt ?? '',
  }
}

async function getClientPage(
  page: number,
) {
  return apiRequest<ClientListResponse>(
    `${
      API_ENDPOINTS.clients
    }${buildQuery({
      page,

      limit: 100,
    })}`,
  )
}

export async function getClients(): Promise<Client[]> {
  const first =
    await getClientPage(1)

  const totalPages =
    first.pagination
      ?.totalPages ?? 1

  if (totalPages <= 1) {
    return first.data.map(
      mapClient,
    )
  }

  const rest =
    await Promise.all(
      Array.from(
        {
          length:
            totalPages - 1,
        },
        (_, index) =>
          getClientPage(
            index + 2,
          ),
      ),
    )

  return [
    ...first.data,

    ...rest.flatMap(
      (response) =>
        response.data,
    ),
  ].map(mapClient)
}

export async function getClient(
  id: string,
): Promise<Client> {
  const response =
    await apiRequest<ClientResponse>(
      API_ENDPOINTS.client(
        id,
      ),
    )

  return mapClient(
    response.data,
  )
}

export async function updateClientAccountStatus(
  id: string,
  accountStatus: AccountStatus,
): Promise<Client> {
  await apiRequest(
    API_ENDPOINTS.clientAccountStatus(
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

  return getClient(id)
}

export async function updateClientPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await apiRequest(
    API_ENDPOINTS.clientPassword(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        newPassword,
      }),
    },
  )
}