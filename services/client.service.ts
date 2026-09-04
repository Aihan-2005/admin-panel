import { MOCK_CLIENTS } from '@/lib/mock/clients.mock'
import type { Client } from '@/types/client'

export async function getClients(): Promise<Client[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return MOCK_CLIENTS
}