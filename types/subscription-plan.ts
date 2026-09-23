export type SubscriptionTier =
  string

export type SubscriptionFeatureCode =
  string

export type SubscriptionDurationUnit =
  | 'WEEK'
  | 'MONTH'

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

  /**
   * Canonical duration used by the frontend.
   *
   * 2 weeks  = 14
   * 1 month  = 30
   * 3 months = 90
   */
  durationDays:
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

  durationDays:
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

export interface SubscriptionSettings {
  trialDays:
    number
}
