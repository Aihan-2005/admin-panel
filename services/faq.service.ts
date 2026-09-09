import {
  apiRequest,
  buildQuery,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  FAQ,
  FAQPagination,
} from '@/types/faq'

interface BackendFAQ {
  _id?: unknown

  id?: string

  question: string

  answer: string

  createdAt?: string

  updatedAt?: string
}

interface FAQListResponse {
  success: boolean

  data: BackendFAQ[]

  pagination:
    FAQPagination
}

interface FAQEntityResponse {
  success: boolean

  data: BackendFAQ
}

function toId(
  value: unknown,
) {
  if (
    typeof value ===
    'string'
  ) {
    return value
  }

  if (
    value === undefined ||
    value === null
  ) {
    return ''
  }

  return String(value)
}

function mapFAQ(
  item: BackendFAQ,
): FAQ {
  return {
    id:
      item.id ||
      toId(
        item._id,
      ),

    question:
      item.question,

    answer:
      item.answer,

    createdAt:
      item.createdAt,

    updatedAt:
      item.updatedAt,
  }
}

export async function getFAQs(
  params: {
    search?: string

    page?: number

    limit?: number
  } = {},
) {
  const response =
    await apiRequest<
      FAQListResponse
    >(
      `${
        API_ENDPOINTS.faq
      }${buildQuery({
        search:
          params.search,

        page:
          params.page ??
          1,

        limit:
          params.limit ??
          20,
      })}`,
    )

  return {
    items:
      response.data.map(
        mapFAQ,
      ),

    pagination:
      response.pagination,
  }
}

export async function createFAQ(
  question: string,
  answer: string,
): Promise<FAQ> {
  const response =
    await apiRequest<
      FAQEntityResponse
    >(
      API_ENDPOINTS.faq,
      {
        method: 'POST',

        body:
          JSON.stringify({
            question:
              question.trim(),

            answer:
              answer.trim(),
          }),
      },
    )

  return mapFAQ(
    response.data,
  )
}

export async function deleteFAQ(
  id: string,
): Promise<void> {
  await apiRequest(
    API_ENDPOINTS.faqItem(
      id,
    ),
    {
      method: 'DELETE',
    },
  )
}