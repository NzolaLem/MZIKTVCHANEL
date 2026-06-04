import type { ReactNode } from 'react'
import { Badge } from './Badge'

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge tone="light">{eyebrow}</Badge>
        <h2 className="mt-4 max-w-4xl text-4xl font-semibold uppercase leading-[0.95] md:text-6xl">{title}</h2>
      </div>
      {children && <div className="max-w-sm text-sm leading-6 text-black/65">{children}</div>}
    </div>
  )
}
