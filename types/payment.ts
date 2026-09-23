export type PaymentProvider =
  'ZARINPAL'


export type PaymentCurrency =
  'IRR'


export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REVERSED'


export type PaymentFulfillmentStatus =
  | 'PENDING'
  | 'FULFILLED'
  | 'REQUIRES_ACTION'
  | 'NOT_APPLICABLE'


export type PaymentProviderState =
  | 'VERIFIED'
  | 'PAID_UNVERIFIED'
  | 'PENDING'
  | 'FAILED'
  | 'REVERSED'
  | 'UNKNOWN'


export interface AdminPaymentPlan {
  id:
    string

  title:
    string

  tier:
    string

  durationMonths:
    number | null
}


export interface AdminPayment {
  id:
    string

  lawyerId:
    string

  plan:
    AdminPaymentPlan

  amount:
    number

  currency:
    PaymentCurrency

  provider:
    PaymentProvider

  status:
    PaymentStatus

  fulfillmentStatus:
    PaymentFulfillmentStatus

  authority:
    string | null

  referenceId:
    string | null

  cardPan:
    string | null

  providerRequestCode:
    number | null

  providerVerificationCode:
    number | null

  providerFee:
    number | null

  providerFeeType:
    string | null

  subscriptionId:
    string | null

  fulfillmentErrorCode:
    string | null

  fulfillmentErrorMessage:
    string | null

  failureCode:
    string | null

  failureMessage:
    string | null

  createdAt:
    string

  paidAt:
    string | null

  fulfilledAt:
    string | null

  cancelledAt:
    string | null

  failedAt:
    string | null

  reversedAt:
    string | null
}


export interface PaymentPagination {
  page:
    number

  limit:
    number

  total:
    number

  totalPages:
    number
}


export interface AdminPaymentListQuery {
  lawyerId?:
    string

  status?:
    PaymentStatus

  fulfillmentStatus?:
    PaymentFulfillmentStatus

  provider?:
    PaymentProvider

  page?:
    number

  limit?:
    number
}


export interface AdminPaymentListResult {
  items:
    AdminPayment[]

  pagination:
    PaymentPagination
}


export interface ReconcileAdminPaymentResult {
  reconciled:
    boolean

  providerState:
    PaymentProviderState

  rawProviderStatus?:
    string | null

  payment:
    AdminPayment
}