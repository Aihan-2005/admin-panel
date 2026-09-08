import {
  apiRequest,
} from '@/lib/api/client'

import {
  API_ENDPOINTS,
} from '@/lib/api/endpoints'

import type {
  DashboardStats,
} from '@/types/dashboard'

interface DashboardResponse {
  success: boolean

  data: DashboardStats
}

export async function getDashboard(): Promise<DashboardStats> {
  const response =
    await apiRequest<DashboardResponse>(
      API_ENDPOINTS.dashboard,
      {
        cache: 'no-store',
      },
    )

  return response.data
}