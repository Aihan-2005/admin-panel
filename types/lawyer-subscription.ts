import type {
  SubscriptionFeatureCode,
  SubscriptionTier,
} from '@/types/subscription-plan'


export type LawyerSubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'


export type LawyerSubscriptionActivationSource =
  | 'ADMIN'
  | 'PAYMENT'


export interface LawyerSubscriptionPlanSnapshot {
  title:
    string

  description:
    string

  tier:
    SubscriptionTier

  tags:
    string[]

  durationMonths:
    number

  price:
    number

  discountPercent:
    number

  features:
    SubscriptionFeatureCode[]
}


export interface LawyerSubscription {
  id:
    string

  lawyerId:
    string

  planId:
    string

  planSnapshot:
    LawyerSubscriptionPlanSnapshot

  startsAt:
    string

  endsAt:
    string

  cancelledAt:
    string | null

  activationSource:
    LawyerSubscriptionActivationSource

  activatedByUserId:
    string | null

  createdAt:
    string

  updatedAt:
    string

  status:
    LawyerSubscriptionStatus
}


export interface LawyerSubscriptionPagination {
  page:
    number

  limit:
    number

  total:
    number

  totalPages:
    number
}


export interface LawyerSubscriptionHistoryResult {
  items:
    LawyerSubscription[]

  pagination:
    LawyerSubscriptionPagination
}