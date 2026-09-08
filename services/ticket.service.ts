import {
  apiRequest,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  Ticket,
  TicketMessage,
  TicketStatus,
} from '@/types/ticket'

interface BackendTicket {
  _id?: unknown

  id?: string

  lawyerId?: unknown

  title: string

  type?:
    | 'BUG'
    | 'SUGGESTION'
    | 'OTHER'

  status: TicketStatus

  createdAt:
    | string
    | Date

  updatedAt?:
    | string
    | Date
}

interface BackendTicketMessage {
  _id?: unknown

  id?: string

  senderId?: unknown

  senderType:
    | 'LAWYER'
    | 'ADMIN'

  message: string

  attachmentId?: unknown

  createdAt:
    | string
    | Date
}

interface ApiEntityResponse<T> {
  success: boolean

  data: T
}

interface ApiListResponse<T> {
  success: boolean

  data: T[]
}

function toId(
  value: unknown,
): string {
  if (
    typeof value ===
    'string'
  ) {
    return value
  }

  if (
    value == null
  ) {
    return ''
  }

  return String(value)
}

function toDateString(
  value:
    | string
    | Date
    | undefined,
) {
  if (!value) {
    return ''
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString()
  }

  return String(value)
}

function mapMessage(
  message: BackendTicketMessage,
): TicketMessage {
  return {
    id: toId(
      message.id ??
        message._id,
    ),

    body:
      message.message,

    senderType:
      message.senderType,

    senderId:
      toId(
        message.senderId,
      ) || null,

    senderName:
      message.senderType ===
      'ADMIN'
        ? 'ادمین'
        : 'وکیل',

    attachmentId:
      toId(
        message.attachmentId,
      ) || null,

    createdAt:
      toDateString(
        message.createdAt,
      ),
  }
}

function mapTicket(
  ticket: BackendTicket,
  messages: TicketMessage[] = [],
): Ticket {
  const lawyerId =
    toId(
      ticket.lawyerId,
    )

  const firstLawyerMessage =
    messages.find(
      (message) =>
        message.senderType ===
        'LAWYER',
    )

  return {
    id: toId(
      ticket.id ??
        ticket._id,
    ),

    subject:
      ticket.title,

    type:
      ticket.type ?? null,

    status:
      ticket.status,

    requesterId:
      lawyerId || null,

   
      
    requesterName:
      lawyerId
        ? `وکیل ${lawyerId.slice(-6)}`
        : 'وکیل',

    requesterType:
      'LAWYER',

    description:
      firstLawyerMessage
        ?.body ?? null,

    createdAt:
      toDateString(
        ticket.createdAt,
      ),

    updatedAt:
      ticket.updatedAt
        ? toDateString(
            ticket.updatedAt,
          )
        : null,

    messages,
  }
}

export async function getTickets(
  params: {
    search?: string

    status?:
      TicketStatus
  } = {},
): Promise<Ticket[]> {
  const response =
    await apiRequest<
      ApiListResponse<BackendTicket>
    >(
      API_ENDPOINTS.tickets,
    )

  let tickets =
    response.data.map(
      (ticket) =>
        mapTicket(ticket),
    )

  if (params.status) {
    tickets =
      tickets.filter(
        (ticket) =>
          ticket.status ===
          params.status,
      )
  }

  if (params.search) {
    const query =
      params.search
        .trim()
        .toLocaleLowerCase(
          'fa-IR',
        )

    tickets =
      tickets.filter(
        (ticket) =>
          [
            ticket.id,

            ticket.subject,

            ticket.requesterId,
          ].some(
            (value) =>
              value
                ?.toLocaleLowerCase(
                  'fa-IR',
                )
                .includes(
                  query,
                ),
          ),
      )
  }

  return tickets
}

export async function getTicket(
  id: string,
): Promise<Ticket> {
  const [
    ticketResponse,
    messagesResponse,
  ] = await Promise.all([
    apiRequest<
      ApiEntityResponse<BackendTicket>
    >(
      API_ENDPOINTS.ticket(
        id,
      ),
    ),

    apiRequest<
      ApiListResponse<BackendTicketMessage>
    >(
      API_ENDPOINTS.ticketMessages(
        id,
      ),
    ),
  ])

  const messages =
    messagesResponse.data.map(
      mapMessage,
    )

  return mapTicket(
    ticketResponse.data,
    messages,
  )
}

export async function replyToTicket(
  id: string,
  body: string,
): Promise<Ticket> {
  await apiRequest(
    API_ENDPOINTS.ticketMessages(
      id,
    ),
    {
      method: 'POST',

      body: JSON.stringify({
        message: body,
      }),
    },
  )

  return getTicket(id)
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  await apiRequest(
    API_ENDPOINTS.ticketStatus(
      id,
    ),
    {
      method: 'PATCH',

      body: JSON.stringify({
        status,
      }),
    },
  )

  return getTicket(id)
}