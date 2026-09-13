import type {
  AddClientLawyerPayload,
  ClientLawyerPlacement,
  UpdateClientLawyerPayload,
} from '@/types/client-lawyer'

const STORAGE_KEY =
  'dadyar-admin:client-lawyers:v1'

function normalizeOrders(
  items: ClientLawyerPlacement[],
): ClientLawyerPlacement[] {
  return [...items]
    .sort(
      (a, b) =>
        a.displayOrder -
        b.displayOrder,
    )
    .map(
      (
        item,
        index,
      ) => ({
        ...item,

        displayOrder:
          index + 1,
      }),
    )
}

function readStorage(): ClientLawyerPlacement[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed =
      JSON.parse(
        raw,
      ) as unknown

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    const items =
      parsed
        .filter(
          (
            item,
          ): item is ClientLawyerPlacement => {
            if (
              !item ||
              typeof item !==
                'object'
            ) {
              return false
            }

            const record =
              item as Record<
                string,
                unknown
              >

            return (
              typeof record.lawyerId ===
                'string' &&
              typeof record.isFeatured ===
                'boolean' &&
              typeof record.displayOrder ===
                'number' &&
              typeof record.addedAt ===
                'string'
            )
          },
        )
        .map(
          (
            item,
          ) => ({
            ...item,

            displayOrder:
              Math.max(
                1,
                Math.trunc(
                  item.displayOrder,
                ),
              ),
          }),
        )

    return normalizeOrders(
      items,
    )
  } catch {
    return []
  }
}

function writeStorage(
  items: ClientLawyerPlacement[],
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalizeOrders(
        items,
      ),
    ),
  )
}

export async function getClientLawyerPlacements(): Promise<
  ClientLawyerPlacement[]
> {
  return readStorage()
}

export async function addClientLawyer(
  payload: AddClientLawyerPayload,
): Promise<ClientLawyerPlacement[]> {
  const current =
    readStorage()

  const exists =
    current.some(
      (item) =>
        item.lawyerId ===
        payload.lawyerId,
    )

  if (exists) {
    throw new Error(
      'این وکیل قبلاً به بخش موکلین اضافه شده است.',
    )
  }

  const sorted =
    normalizeOrders(
      current,
    )

  const targetIndex =
    Math.max(
      0,
      Math.min(
        sorted.length,
        Math.trunc(
          payload.displayOrder,
        ) - 1,
      ),
    )

  const newItem: ClientLawyerPlacement =
    {
      lawyerId:
        payload.lawyerId,

      isFeatured:
        payload.isFeatured,

      displayOrder:
        targetIndex + 1,

      addedAt:
        new Date().toISOString(),
    }

  sorted.splice(
    targetIndex,
    0,
    newItem,
  )

  const result =
    normalizeOrders(
      sorted,
    )

  writeStorage(
    result,
  )

  return result
}

export async function updateClientLawyer(
  lawyerId: string,
  payload: UpdateClientLawyerPayload,
): Promise<ClientLawyerPlacement[]> {
  const current =
    readStorage()

  const exists =
    current.some(
      (item) =>
        item.lawyerId ===
        lawyerId,
    )

  if (!exists) {
    throw new Error(
      'وکیل موردنظر در بخش موکلین وجود ندارد.',
    )
  }

  const result =
    current.map(
      (item) =>
        item.lawyerId ===
        lawyerId
          ? {
              ...item,

              ...(typeof payload.isFeatured ===
              'boolean'
                ? {
                    isFeatured:
                      payload.isFeatured,
                  }
                : {}),
            }
          : item,
    )

  writeStorage(
    result,
  )

  return normalizeOrders(
    result,
  )
}

export async function removeClientLawyer(
  lawyerId: string,
): Promise<ClientLawyerPlacement[]> {
  const current =
    readStorage()

  const result =
    normalizeOrders(
      current.filter(
        (item) =>
          item.lawyerId !==
          lawyerId,
      ),
    )

  writeStorage(
    result,
  )

  return result
}

export async function moveClientLawyer(
  lawyerId: string,
  direction:
    | 'up'
    | 'down',
): Promise<ClientLawyerPlacement[]> {
  const items =
    normalizeOrders(
      readStorage(),
    )

  const index =
    items.findIndex(
      (item) =>
        item.lawyerId ===
        lawyerId,
    )

  if (index === -1) {
    return items
  }

  const targetIndex =
    direction ===
    'up'
      ? index - 1
      : index + 1

  if (
    targetIndex <
      0 ||
    targetIndex >=
      items.length
  ) {
    return items
  }

  const next = [
    ...items,
  ]

  const currentItem =
    next[index]

  const targetItem =
    next[targetIndex]

  next[index] =
    targetItem

  next[targetIndex] =
    currentItem

  const result =
    next.map(
      (
        item,
        itemIndex,
      ) => ({
        ...item,

        displayOrder:
          itemIndex + 1,
      }),
    )

  writeStorage(
    result,
  )

  return result
}
