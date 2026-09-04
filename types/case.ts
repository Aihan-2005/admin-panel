export interface LegalCase {
  id: string

  title: string

  caseNumber?: string | null

  clientName?: string | null

  lawyerName?: string | null

  status?: string | null

  createdAt: string

  updatedAt?: string | null
}