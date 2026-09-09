import {
  apiRequest,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import {
  getLawyer,
  getLawyers,
} from '@/services/lawyer.service'

import type {
  Lawyer,
} from '@/types/lawyer'

import type {
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketType,
} from '@/types/ticket'

interface BackendTicket {
  _id?: unknown

  id?: string

  lawyerId?: unknown

  title: string

  type?: TicketType

  status: TicketStatus

  messageCount?: number

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

interface AttachmentUrlResponse {
  success: boolean

  data: {
    url: string
  }
}

interface RequesterIdentity {
  id: string

  name: string

  phone: string | null

  email: string | null
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
    value === null ||
    value === undefined
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

function lawyerToIdentity(
  lawyer: Lawyer,
): RequesterIdentity {
  return {
    id: lawyer.id,

    name:
      lawyer.fullName ||
      lawyer.phone ||
      lawyer.email ||
      'وکیل',

    phone:
      lawyer.phone ||
      null,

    email:
      lawyer.email ||
      null,
  }
}

function fallbackIdentity(
  lawyerId: string,
): RequesterIdentity {
  return {
    id: lawyerId,

    name:
      lawyerId
        ? `وکیل`
        : 'نامشخص',

    phone: null,

    email: null,
  }
}

function mapMessage(
  message: BackendTicketMessage,
  requester?: RequesterIdentity,
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
        : requester?.name ??
          'وکیل',

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
  requester: RequesterIdentity,
  messages: TicketMessage[] = [],
): Ticket {
  const firstLawyerMessage =
    messages.find(
      (message) =>
        message.senderType ===
        'LAWYER',
    )

  return {
    id:
      toId(
        ticket.id ??
          ticket._id,
      ),

    subject:
      ticket.title,

    type:
      ticket.type ??
      null,

    status:
      ticket.status,

    requesterId:
      requester.id ||
      null,

    requesterName:
      requester.name,

    requesterPhone:
      requester.phone,

    requesterEmail:
      requester.email,

    requesterType:
      'LAWYER',

    messageCount:
      ticket.messageCount ??
      messages.length,

    description:
      firstLawyerMessage
        ?.body ??
      null,

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

function getLawyerId(
  ticket: BackendTicket,
) {
  return toId(
    ticket.lawyerId,
  )
}

export async function getTickets(
  params: {
    search?: string

    status?: TicketStatus
  } = {},
): Promise<Ticket[]> {
  const [
    response,
    lawyers,
  ] = await Promise.all([
    apiRequest<
      ApiListResponse<BackendTicket>
    >(
      API_ENDPOINTS.tickets,
    ),

    getLawyers().catch(
      () => [] as Lawyer[],
    ),
  ])

  const lawyerMap =
    new Map<
      string,
      RequesterIdentity
    >()

  lawyers.forEach(
    (lawyer) => {
      lawyerMap.set(
        lawyer.id,
        lawyerToIdentity(
          lawyer,
        ),
      )
    },
  )

  let tickets =
    response.data.map(
      (ticket) => {
        const lawyerId =
          getLawyerId(
            ticket,
          )

        const requester =
          lawyerMap.get(
            lawyerId,
          ) ??
          fallbackIdentity(
            lawyerId,
          )

        return mapTicket(
          ticket,
          requester,
        )
      },
    )

  if (params.status) {
    tickets =
      tickets.filter(
        (ticket) =>
          ticket.status ===
          params.status,
      )
  }

  if (
    params.search?.trim()
  ) {
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
            ticket.requesterName,
            ticket.requesterPhone,
            ticket.requesterEmail,
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

  const lawyerId =
    getLawyerId(
      ticketResponse.data,
    )

  let requester =
    fallbackIdentity(
      lawyerId,
    )

  if (lawyerId) {
    try {
      const lawyer =
        await getLawyer(
          lawyerId,
        )

      requester =
        lawyerToIdentity(
          lawyer,
        )
    } catch {
      // اطلاعات تیکت حتی اگر
      // دریافت پروفایل وکیل
      // شکست خورد نمایش داده شود.
    }
  }

  const messages =
    messagesResponse.data.map(
      (message) =>
        mapMessage(
          message,
          requester,
        ),
    )

  return mapTicket(
    ticketResponse.data,
    requester,
    messages,
  )
}

export async function replyToTicket(
  id: string,
  message: string,
  attachment?: File | null,
): Promise<Ticket> {
  const trimmedMessage =
    message.trim()

  if (!trimmedMessage) {
    throw new Error(
      'متن پاسخ نمی‌تواند خالی باشد.',
    )
  }

  if (attachment) {
    const formData =
      new FormData()

    formData.append(
      'message',
      trimmedMessage,
    )

    formData.append(
      'attachment',
      attachment,
    )

    await apiRequest(
      API_ENDPOINTS.ticketMessages(
        id,
      ),
      {
        method: 'POST',

        body: formData,
      },
    )
  } else {
    await apiRequest(
      API_ENDPOINTS.ticketMessages(
        id,
      ),
      {
        method: 'POST',

        body: JSON.stringify({
          message:
            trimmedMessage,
        }),
      },
    )
  }

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

export async function getTicketAttachmentUrl(
  ticketId: string,
  messageId: string,
): Promise<string> {
  const response =
    await apiRequest<
      AttachmentUrlResponse
    >(
      API_ENDPOINTS.ticketMessageAttachment(
        ticketId,
        messageId,
      ),
    )

  if (
    !response.data?.url
  ) {
    throw new Error(
      'لینک فایل از سرور دریافت نشد.',
    )
  }

  return response.data.url
}
