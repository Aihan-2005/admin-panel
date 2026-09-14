import { apiRequest } from "@/lib/api/client";

import type {
  AddClientLawyerPayload,
  ClientLawyerPlacement,
  UpdateClientLawyerPayload,
} from "@/types/client-lawyer";

const CLIENT_LAWYERS_ENDPOINT =
  "/admin/client-lawyers";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function sortPlacements(
  placements: ClientLawyerPlacement[],
): ClientLawyerPlacement[] {
  return [...placements].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  );
}

async function fetchPlacements(): Promise<
  ClientLawyerPlacement[]
> {
  const response =
    await apiRequest<
      ApiResponse<
        ClientLawyerPlacement[]
      >
    >(
      CLIENT_LAWYERS_ENDPOINT,
      {
        method: "GET",
      },
    );

  return sortPlacements(
    response.data,
  );
}

export async function getClientLawyerPlacements(): Promise<
  ClientLawyerPlacement[]
> {
  return fetchPlacements();
}

export async function addClientLawyer(
  payload: AddClientLawyerPayload,
): Promise<
  ClientLawyerPlacement[]
> {
  await apiRequest<
    ApiResponse<ClientLawyerPlacement>
  >(
    `${CLIENT_LAWYERS_ENDPOINT}/${payload.lawyerId}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        isFeatured:
          payload.isFeatured,

        displayOrder:
          payload.displayOrder,
      }),
    },
  );

  return fetchPlacements();
}

export async function updateClientLawyer(
  lawyerId: string,
  payload: UpdateClientLawyerPayload,
): Promise<
  ClientLawyerPlacement[]
> {
  const body:
    UpdateClientLawyerPayload =
    {};

  if (
    payload.isFeatured !==
    undefined
  ) {
    body.isFeatured =
      payload.isFeatured;
  }

  if (
    payload.displayOrder !==
    undefined
  ) {
    body.displayOrder =
      payload.displayOrder;
  }

  await apiRequest<
    ApiResponse<ClientLawyerPlacement>
  >(
    `${CLIENT_LAWYERS_ENDPOINT}/${lawyerId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          body,
        ),
    },
  );

  return fetchPlacements();
}

export async function removeClientLawyer(
  lawyerId: string,
): Promise<
  ClientLawyerPlacement[]
> {
  await apiRequest<{
    success: boolean;
  }>(
    `${CLIENT_LAWYERS_ENDPOINT}/${lawyerId}`,
    {
      method:
        "DELETE",
    },
  );

  return fetchPlacements();
}

export async function moveClientLawyer(
  lawyerId: string,

  direction:
    | "up"
    | "down",
): Promise<
  ClientLawyerPlacement[]
> {
  const placements =
    await fetchPlacements();

  const currentIndex =
    placements.findIndex(
      (placement) =>
        placement.lawyerId ===
        lawyerId,
    );

  if (
    currentIndex ===
    -1
  ) {
    return placements;
  }

  const targetIndex =
    direction === "up"
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    targetIndex < 0 ||
    targetIndex >=
      placements.length
  ) {
    return placements;
  }

  const target =
    placements[
      targetIndex
    ];

  await apiRequest<
    ApiResponse<ClientLawyerPlacement>
  >(
    `${CLIENT_LAWYERS_ENDPOINT}/${lawyerId}`,
    {
      method:
        "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          displayOrder:
            target.displayOrder,
        }),
    },
  );

  return fetchPlacements();
}