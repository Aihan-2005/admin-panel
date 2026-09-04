function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  )
}

export function normalizeList<T>(
  payload: unknown,
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!isRecord(payload)) {
    return []
  }

  for (const key of [
    'items',
    'content',
    'results',
    'data',
  ]) {
    const value = payload[key]

    if (Array.isArray(value)) {
      return value as T[]
    }

    if (isRecord(value)) {
      const nested =
        normalizeList<T>(value)

      if (nested.length > 0) {
        return nested
      }
    }
  }

  return []
}

export function normalizeEntity<T>(
  payload: unknown,
): T {
  if (
    isRecord(payload) &&
    isRecord(payload.data)
  ) {
    return payload.data as T
  }

  return payload as T
}