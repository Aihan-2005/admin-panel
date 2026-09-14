import type {
  Lawyer,
} from "@/types/lawyer";

export interface ClientLawyerPlacement {
  lawyerId: string;

  isFeatured: boolean;

  displayOrder: number;

  addedAt:
    | string
    | null;
}

export interface ManagedClientLawyer
  extends Lawyer,
    ClientLawyerPlacement {}

export interface AddClientLawyerPayload {
  lawyerId: string;

  isFeatured: boolean;

  displayOrder: number;
}

export interface UpdateClientLawyerPayload {
  isFeatured?: boolean;

  displayOrder?: number;
}
