import {
  AlertCircle,
  Loader2,
} from 'lucide-react'

export function LoadingState({
  label = 'در حال بارگذاری...',
}: {
  label?: string
}) {
  return (
    <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-500">
      <Loader2
        size={20}
        className="animate-spin"
      />

      {label}
    </div>
  )
}

export function EmptyState({
  message,
}: {
  message: string
}) {
  return (
    <div className="p-12 text-center text-sm text-zinc-400">
      {message}
    </div>
  )
}

export function ErrorState({
  message,
}: {
  message: string
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  )
}