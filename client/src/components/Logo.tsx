import { cn } from './ui'

function BuildingIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
    </svg>
  )
}

/**
 * JobFlow logo: building icon on the left + lowercase "jobflow" wordmark.
 * `dark` (default) for light backgrounds; `light` for navy/dark backgrounds.
 */
export function Logo({
  variant = 'dark',
  iconSize = 28,
  wordmarkClassName = 'text-xl',
  showWordmark = true,
  className,
}: {
  variant?: 'dark' | 'light'
  iconSize?: number
  wordmarkClassName?: string
  showWordmark?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BuildingIcon size={iconSize} className={variant === 'light' ? 'text-skyaccent' : 'text-brand-600'} />
      {showWordmark && (
        <span
          className={cn(
            'font-semibold lowercase tracking-tight',
            variant === 'light' ? 'text-white' : 'text-ink-900',
            wordmarkClassName,
          )}
        >
          jobflow
        </span>
      )}
    </span>
  )
}
