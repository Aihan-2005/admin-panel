export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_LAWYER'
  | 'RESOLVED'
  | 'CLOSED'

export interface TicketMessage {
  id: string

  body: string

  senderType:
    | 'ADMIN'
    | 'LAWYER'

  senderId?:
    | string
    | null

  senderName?:
    | string
    | null

  attachmentId?:
    | string
    | null

  createdAt: string
}

export interface Ticket {
  id: string

  subject: string

  type?:
    | 'BUG'
    | 'SUGGESTION'
    | 'OTHER'
    | null

  description?:
    | string
    | null

  status: TicketStatus

  requesterId?:
    | string
    | null

  requesterName?:
    | string
    | null

  requesterType:
    | 'LAWYER'

  createdAt: string

  updatedAt?:
    | string
    | null

  messages?: TicketMessage[]
}

export const TICKET_STATUS_LABELS: Record<
  TicketStatus,
  string
> = {
  OPEN:
    'باز',

  IN_PROGRESS:
    'در حال بررسی',

  WAITING_FOR_LAWYER:
    'در انتظار پاسخ وکیل',

  RESOLVED:
    'حل شده',

  CLOSED:
    'بسته',
}