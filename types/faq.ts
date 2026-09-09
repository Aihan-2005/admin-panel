export interface FAQ {
  id: string

  question: string

  answer: string

  createdAt?: string

  updatedAt?: string
}

export interface FAQPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}