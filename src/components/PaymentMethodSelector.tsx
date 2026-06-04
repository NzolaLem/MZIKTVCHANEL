import type { PaymentMethod } from '../types'
import { cn } from '../lib/cn'

const paymentLabels: Record<PaymentMethod, string> = {
  mpesa: 'M-Pesa',
  emola: 'e-Mola',
  card: 'Visa / Card payment',
}

const paymentOptions: Array<{ id: PaymentMethod; description: string }> = [
  { id: 'mpesa', description: 'Mock mobile money payment' },
  { id: 'emola', description: 'Mock e-wallet payment' },
  { id: 'card', description: 'Mock card authorization' },
]

export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod
  onChange: (paymentMethod: PaymentMethod) => void
}) {
  return (
    <div className="grid gap-3">
      {paymentOptions.map((option) => {
        const isSelected = value === option.id

        return (
          <button
            className={cn(
              'flex items-center gap-4 border p-4 text-left transition',
              isSelected ? 'border-black bg-black text-white' : 'border-black bg-white text-black hover:bg-black hover:text-white',
            )}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            <span
              className={cn(
                'flex h-14 w-24 shrink-0 items-center justify-center border bg-white text-black',
                isSelected ? 'border-white' : 'border-black',
              )}
            >
              <PaymentLogo method={option.id} />
            </span>
            <span>
              <span className="block font-semibold uppercase">{paymentLabels[option.id]}</span>
              <span className={cn('text-sm', isSelected ? 'text-white/70' : 'text-black/60')}>{option.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function PaymentLogo({ method }: { method: PaymentMethod }) {
  if (method === 'mpesa') {
    return (
      <span className="grid leading-none">
        <span className="text-lg font-black tracking-normal text-[#e31b23]">M</span>
        <span className="-mt-1 text-lg font-black tracking-normal text-[#19a64a]">PESA</span>
      </span>
    )
  }

  if (method === 'emola') {
    return (
      <span className="text-xl font-black tracking-normal">
        <span className="text-[#ee7b22]">e</span>
        <span className="text-[#1b57a6]">Mola</span>
      </span>
    )
  }

  return <span className="text-2xl font-black italic tracking-normal text-[#1434cb]">VISA</span>
}
