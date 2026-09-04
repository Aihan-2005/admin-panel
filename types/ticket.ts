export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'ANSWERED'
  | 'CLOSED'

export interface TicketMessage {
  id: string
  body: string

  senderType:
    | 'ADMIN'
    | 'USER'
    | 'LAWYER'
    | 'CLIENT'
    | string

  senderName?: string | null

  createdAt: string
}

export interface Ticket {
  id: string
  subject: string

  description?: string | null

  status: TicketStatus

  requesterName?: string | null

  requesterType?:
    | 'LAWYER'
    | 'CLIENT'
    | string
    | null

  createdAt: string

  updatedAt?: string | null

  messages?: TicketMessage[]
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'باز',
  IN_PROGRESS: 'در حال بررسی',
  ANSWERED: 'پاسخ داده شده',
  CLOSED: 'بسته',
}