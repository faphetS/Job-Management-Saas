import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/components/ui'

/** One-shot IntersectionObserver: returns a ref + whether it has entered the viewport. */
export function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            obs.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [shown])

  return { ref, shown }
}

/** Wrapper that fades + rises its children into view once, with an optional stagger delay. */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: ReactNode
}) {
  const { ref, shown } = useReveal()
  return (
    <div ref={ref} className={cn('lp-reveal', shown && 'lp-in', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
