export type SubscriptionTier =
  string


export type SubscriptionFeatureCode =
  string


export interface SubscriptionFeatureOption {
  code:
    SubscriptionFeatureCode

  title:
    string

  description:
    string
}


export interface SubscriptionPlanOptions {
  tiers:
    SubscriptionTier[]

  features:
    SubscriptionFeatureOption[]
}


export interface SubscriptionPlan {
  id:
    string

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

  isActive:
    boolean

  sortOrder:
    number

  createdAt?:
    string

  updatedAt?:
    string
}


export interface SubscriptionPlanPayload {
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

  isActive:
    boolean

  sortOrder:
    number
}


export type UpdateSubscriptionPlanPayload =
  Partial<SubscriptionPlanPayload>