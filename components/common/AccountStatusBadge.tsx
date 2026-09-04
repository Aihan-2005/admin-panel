import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from '@/types/common'

export function AccountStatusBadge({
  status,
}: {
  status: AccountStatus
}) {
  const style =
    status === 'ACTIVE'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-700'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${style}`}
    >
      {
        ACCOUNT_STATUS_LABELS[
          status
        ]
      }
    </span>
  )
}