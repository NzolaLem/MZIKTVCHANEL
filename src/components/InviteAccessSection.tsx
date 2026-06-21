import { ArrowRight, CheckCircle2, KeyRound, Loader2, LockKeyhole, QrCode, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent, type HTMLInputTypeAttribute, type ReactNode } from 'react'
import type { GuestGender, Order } from '../types'
import { verifyGuestInvite } from '../data/invites'
import { inviteSectionId } from '../lib/inviteNavigation'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { TicketPreview } from './TicketPreview'

const genderOptions: Array<{ label: string; value: GuestGender }> = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const initialForm = {
  fullName: '',
  gender: '' as GuestGender | '',
  inviteCode: '',
  password: '',
}

type FormErrors = Partial<Record<keyof typeof initialForm | 'form', string>>
type InviteFormState = typeof initialForm
type StoredInviteAccess = {
  form: InviteFormState
  order: Order
}

const inviteAccessStorageKey = 'mzik-invite-access-v1'

export function InviteAccessSection({ onContinue }: { onContinue?: (order: Order) => void }) {
  const [storedInviteAccess] = useState(() => readStoredInviteAccess())
  const [form, setForm] = useState<InviteFormState>(storedInviteAccess?.form ?? initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketOrder, setTicketOrder] = useState<Order | null>(storedInviteAccess?.order ?? null)

  useEffect(() => {
    if (!ticketOrder) {
      return
    }

    writeStoredInviteAccess({
      form,
      order: ticketOrder,
    })
  }, [form, ticketOrder])

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
    setTicketOrder(null)
    clearStoredInviteAccess()
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const fullName = form.fullName.trim()
    const inviteCode = form.inviteCode.trim()
    const password = form.password.trim()
    const nextErrors: FormErrors = {}

    if (!fullName) {
      nextErrors.fullName = 'Enter the guest name.'
    } else if (fullName.length > 80) {
      nextErrors.fullName = 'Guest name is too long.'
    }

    if (!form.gender) {
      nextErrors.gender = 'Select a gender.'
    }

    if (!inviteCode) {
      nextErrors.inviteCode = 'Enter the invite code.'
    }

    if (!password) {
      nextErrors.password = 'Enter the party password.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setTicketOrder(null)
      return
    }

    setIsSubmitting(true)
    const result = await verifyGuestInvite({
      fullName,
      gender: form.gender as GuestGender,
      inviteCode,
      password,
    })
    setIsSubmitting(false)

    if (!result.ok) {
      setErrors({ form: result.error })
      setTicketOrder(null)
      return
    }

    const nextForm = {
      ...form,
      fullName,
      inviteCode,
      password,
    }

    setForm(nextForm)
    setErrors({})
    setTicketOrder(result.order)
    writeStoredInviteAccess({
      form: nextForm,
      order: result.order,
    })
  }

  return (
    <section className="scroll-mt-24" id={inviteSectionId}>
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <form className="grid gap-5 border border-white/18 bg-white p-5 text-black md:p-6" onSubmit={submit}>
          <div>
            <p className="inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-semibold uppercase text-white">
              <LockKeyhole size={15} />
              Invite access
            </p>
            <h3 className="mt-4 text-3xl font-semibold uppercase leading-none md:text-5xl">Unlock your ticket</h3>
          </div>

          <Field
            error={errors.fullName}
            icon={<UserRound size={17} />}
            label="Guest name"
            maxLength={80}
            name="guest-name"
            onChange={(value) => updateField('fullName', value)}
            placeholder="Name on the guest list"
            value={form.fullName}
          />

          <div className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-black/65">Gender</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {genderOptions.map((option) => {
                const isSelected = form.gender === option.value

                return (
                  <label
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center justify-center border px-3 py-2 text-center text-xs font-semibold uppercase transition',
                      isSelected ? 'border-black bg-black text-white' : 'border-black bg-white text-black hover:bg-black hover:text-white',
                    )}
                    key={option.value}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="gender"
                      onChange={() => updateField('gender', option.value)}
                      type="radio"
                      value={option.value}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
            {errors.gender && <span className="text-xs font-semibold text-mzik-red">{errors.gender}</span>}
          </div>

          <Field
            error={errors.inviteCode}
            icon={<KeyRound size={17} />}
            label="Invite code"
            maxLength={24}
            name="invite-code"
            onChange={(value) => updateField('inviteCode', value)}
            placeholder="LIVE-258"
            value={form.inviteCode}
          />

          <Field
            error={errors.password}
            icon={<LockKeyhole size={17} />}
            label="Party password"
            maxLength={32}
            name="party-password"
            onChange={(value) => updateField('password', value)}
            placeholder="TRIUNFO10"
            type="password"
            value={form.password}
          />

          {errors.form && <p className="border border-mzik-red bg-mzik-red px-4 py-3 text-sm font-semibold text-white">{errors.form}</p>}

          <Button className="w-full" disabled={isSubmitting} type="submit" variant="dark">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Checking guest list
              </>
            ) : (
              <>
                View ticket
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <div aria-live="polite">
          {ticketOrder ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-white/18 bg-black px-4 py-3 text-white">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase text-white/72">
                  <CheckCircle2 size={18} />
                  Ticket unlocked
                </p>
                <p className="text-xs font-semibold uppercase text-white/42">{ticketOrder.guest?.inviteLabel}</p>
              </div>
              <TicketPreview order={ticketOrder} />
              {onContinue && (
                <Button className="w-full" onClick={() => onContinue(ticketOrder)} variant="light">
                  Continue to website
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          ) : (
            <LockedTicketPreview />
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  error,
  icon,
  label,
  maxLength,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string
  icon: ReactNode
  label: string
  maxLength: number
  name: string
  onChange: (value: string) => void
  placeholder: string
  type?: HTMLInputTypeAttribute
  value: string
}) {
  const inputId = `invite-${name}`
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="text-xs font-semibold uppercase text-black/65">{label}</span>
      <span className="flex h-12 items-center border border-black bg-white focus-within:bg-mzik-lavender/40">
        <span className="flex h-full w-12 items-center justify-center border-r border-black text-black/55">{icon}</span>
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-base uppercase outline-none placeholder:normal-case placeholder:text-black/35"
          id={inputId}
          maxLength={maxLength}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </span>
      {error && (
        <span className="text-xs font-semibold text-mzik-red" id={errorId}>
          {error}
        </span>
      )}
    </label>
  )
}

function LockedTicketPreview() {
  return (
    <article className="ticket-pass grid min-h-[520px] content-between p-5 text-white md:p-7">
      <div>
        <div className="ticket-pass-shine" />
        <div className="ticket-pass-top" />
        <p className="relative z-10 mt-10 text-xs font-black uppercase text-white/35">Digital ticket</p>
        <h3 className="relative z-10 mt-4 max-w-md text-5xl font-black uppercase leading-[0.82] md:text-7xl">
          Guest list access
        </h3>
      </div>

      <div className="relative z-10 grid gap-4 border-y border-dashed border-white/14 py-5">
        <p className="text-sm font-semibold uppercase text-white/52">Name / Gender / Code / Password</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {['Guest', 'Gender', 'Code', 'Password'].map((item) => (
            <div className="border border-white/18 p-3" key={item}>
              <p className="text-[0.68rem] font-semibold uppercase text-white/35">{item}</p>
              <div className="mt-3 h-2 bg-white/18" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid gap-4 sm:grid-cols-[1fr_150px] sm:items-end">
        <div>
          <div className="ticket-barcode" aria-hidden />
          <p className="mt-3 text-xs font-black uppercase text-white/28">MzikTV / Invite only</p>
        </div>
        <div className="grid aspect-square place-items-center border border-white/18 bg-white text-black">
          <QrCode size={58} />
        </div>
      </div>
    </article>
  )
}

function readStoredInviteAccess() {
  try {
    const storedValue = window.sessionStorage.getItem(inviteAccessStorageKey)

    if (!storedValue) {
      return null
    }

    const storedInviteAccess = JSON.parse(storedValue) as StoredInviteAccess

    if (!storedInviteAccess?.order?.id || !storedInviteAccess.form?.fullName) {
      clearStoredInviteAccess()
      return null
    }

    return storedInviteAccess
  } catch {
    return null
  }
}

function writeStoredInviteAccess(inviteAccess: StoredInviteAccess) {
  window.sessionStorage.setItem(inviteAccessStorageKey, JSON.stringify(inviteAccess))
}

function clearStoredInviteAccess() {
  window.sessionStorage.removeItem(inviteAccessStorageKey)
}
