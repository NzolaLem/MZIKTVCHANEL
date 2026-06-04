import { ArrowRight, Loader2 } from 'lucide-react'
import { useState, type FormEvent, type HTMLInputTypeAttribute, type InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BuyerDetails, PaymentMethod } from '../types'
import { useOrder } from '../context/useOrder'
import { Button } from './Button'
import { OrderSummary } from './OrderSummary'
import { PaymentMethodSelector } from './PaymentMethodSelector'

const initialBuyerDetails: BuyerDetails = {
  fullName: '',
  email: '',
  phone: '',
  instagram: '',
}

export function CheckoutForm() {
  const navigate = useNavigate()
  const { confirmOrder, draftOrder } = useOrder()
  const [buyerDetails, setBuyerDetails] = useState<BuyerDetails>(initialBuyerDetails)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [errors, setErrors] = useState<Partial<Record<keyof BuyerDetails, string>>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const updateField = (field: keyof BuyerDetails, value: string) => {
    setBuyerDetails((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const getSanitizedBuyerDetails = (): BuyerDetails => ({
    fullName: buyerDetails.fullName.trim(),
    email: buyerDetails.email.trim(),
    phone: buyerDetails.phone.trim(),
    instagram: buyerDetails.instagram?.trim() || undefined,
  })

  const validate = (details: BuyerDetails) => {
    const nextErrors: Partial<Record<keyof BuyerDetails, string>> = {}

    if (!details.fullName) {
      nextErrors.fullName = 'Full name is required.'
    } else if (details.fullName.length > 80) {
      nextErrors.fullName = 'Full name is too long.'
    }

    if (!details.email) {
      nextErrors.email = 'Email is required.'
    } else if (details.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      nextErrors.email = 'Enter a valid email.'
    }

    const phoneDigits = details.phone.replace(/\D/g, '')

    if (!details.phone) {
      nextErrors.phone = 'Phone number is required.'
    } else if (details.phone.length > 24 || phoneDigits.length < 8 || phoneDigits.length > 15 || !/^\+?[\d\s().-]+$/.test(details.phone)) {
      nextErrors.phone = 'Enter a valid phone number.'
    }

    if (details.instagram && details.instagram.length > 30) {
      nextErrors.instagram = 'Instagram handle is too long.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const sanitizedBuyerDetails = getSanitizedBuyerDetails()

    if (!validate(sanitizedBuyerDetails)) {
      return
    }

    setIsProcessing(true)
    window.setTimeout(() => {
      const order = confirmOrder(sanitizedBuyerDetails, paymentMethod)
      setIsProcessing(false)

      if (order) {
        navigate(`/confirmation/${order.id}`)
      }
    }, 1100)
  }

  return (
    <form className="grid gap-6" onSubmit={submit}>
      {draftOrder && (
        <div className="order-1 md:order-2">
          <OrderSummary eventTitle={draftOrder.event.title} items={draftOrder.items} />
        </div>
      )}

      <div className="order-2 grid gap-4 md:order-1">
        <Field
          error={errors.fullName}
          label="Full name"
          name="fullName"
          onChange={(value) => updateField('fullName', value)}
          autoComplete="name"
          maxLength={80}
          placeholder="Your full name"
          value={buyerDetails.fullName}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={errors.email}
            label="Email"
            name="email"
            onChange={(value) => updateField('email', value)}
            autoComplete="email"
            maxLength={254}
            placeholder="you@email.com"
            type="email"
            value={buyerDetails.email}
          />
          <Field
            error={errors.phone}
            label="Phone number"
            name="phone"
            onChange={(value) => updateField('phone', value)}
            autoComplete="tel"
            inputMode="tel"
            maxLength={24}
            placeholder="+258 ..."
            type="tel"
            value={buyerDetails.phone}
          />
        </div>
        <Field
          error={errors.instagram}
          label="Instagram handle"
          name="instagram"
          onChange={(value) => updateField('instagram', value)}
          autoComplete="off"
          maxLength={30}
          placeholder="@optional"
          value={buyerDetails.instagram ?? ''}
        />
      </div>

      <div className="order-3">
        <h2 className="text-sm font-semibold uppercase">Payment method</h2>
        <div className="mt-3">
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        </div>
      </div>

      <Button className="order-4 w-full" disabled={isProcessing} type="submit" variant="dark">
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Processing payment
          </>
        ) : (
          <>
            Confirm purchase
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  autoComplete,
  inputMode,
  maxLength,
}: {
  label: string
  name: keyof BuyerDetails
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: HTMLInputTypeAttribute
  error?: string
  autoComplete?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
}) {
  const inputId = `checkout-${name}`
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="text-xs font-semibold uppercase text-black/65">{label}</span>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className="h-12 border border-black bg-white px-4 text-base outline-none transition placeholder:text-black/35 focus:bg-mzik-lavender/40"
        id={inputId}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error && (
        <span className="text-xs font-semibold text-mzik-red" id={errorId}>
          {error}
        </span>
      )}
    </label>
  )
}
