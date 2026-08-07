import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  CANDIDATE_STATUS_DOTS,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_VARIANTS,
  type CandidateStatus,
} from '@/lib/types'

export function StatusBadge({
  status,
  showDot = true,
  className,
}: {
  status: CandidateStatus
  showDot?: boolean
  className?: string
}) {
  return (
    <Badge
      variant={CANDIDATE_STATUS_VARIANTS[status]}
      className={cn('h-6 gap-1.5 px-3 text-[0.8125rem]', className)}
    >
      {showDot && (
        <span
          aria-hidden
          className={cn('size-1.5 rounded-full', CANDIDATE_STATUS_DOTS[status])}
        />
      )}
      {CANDIDATE_STATUS_LABELS[status]}
    </Badge>
  )
}
