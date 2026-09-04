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
  Ticket,
  TicketStatus,
} from '@/types/ticket'

export async function getTickets(
  params: {
    search?: string
    status?: TicketStatus
  } = {},
): Promise<Ticket[]> {
  const payload =
    await apiRequest<unknown>(
      `${
        API_ENDPOINTS.tickets
      }${buildQuery(params)}`,
    )

  return normalizeList<Ticket>(
    payload,
  )
}

export async function getTicket(
  id: string,
): Promise<Ticket> {
  const payload =
    await apiRequest<unknown>(
      API_ENDPOINTS.ticket(id),
    )

  return normalizeEntity<Ticket>(
    payload,
  )
}

export async function replyToTicket(
  id: string,
  body: string,
): Promise<Ticket> {
  await apiRequest<unknown>(
    API_ENDPOINTS.ticketReply(id),
    {
      method: 'POST',

      body: JSON.stringify({
        body,
      }),
    },
  )

  return getTicket(id)
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  await apiRequest<unknown>(
    API_ENDPOINTS.ticketStatus(id),
    {
      method: 'PATCH',

      body: JSON.stringify({
        status,
      }),
    },
  )

  return getTicket(id)
}