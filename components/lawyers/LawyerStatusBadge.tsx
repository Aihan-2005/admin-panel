import {
  LAWYER_STATE_LABELS,
  type LawyerState,
} from '@/types/lawyer'

const STATE_STYLES: Record<LawyerState, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-orange-50 text-orange-700 border-orange-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
}

export function LawyerStatusBadge({ state }: { state: LawyerState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATE_STYLES[state]}`}
    >
      {LAWYER_STATE_LABELS[state]}
    </span>
  )
}