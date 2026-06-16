import { KeyRound, Loader2, LockKeyhole, Plus, RefreshCw, ShieldCheck, Trash2, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type HTMLInputTypeAttribute } from 'react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { featuredEvent } from '../data/events'
import type { GuestGender } from '../types'
import {
  ApiError,
  deleteAdminGuest,
  generateGuestPassword,
  getGuestList,
  loginAdmin,
  normalizeGuestName,
  normalizeInviteCode,
  saveAdminGuest,
  type AdminSession,
  type RegisteredGuest,
} from '../data/invites'
import { formatEventDate } from '../lib/dates'
import { cn } from '../lib/cn'

const adminSessionStorageKey = 'mzik-admin-session-v1'

const genderOptions: Array<{ label: string; value: GuestGender }> = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

type AdminGuestForm = {
  fullName: string
  gender: GuestGender
  accessCode: string
  password: string
  ticketTypeId: string
}

type AdminErrors = Partial<Record<keyof AdminGuestForm | 'form', string>>

export function AdminDashboardPage() {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession())
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoadingGuests, setIsLoadingGuests] = useState(false)
  const [isCreatingGuest, setIsCreatingGuest] = useState(false)
  const [guests, setGuests] = useState<RegisteredGuest[]>([])
  const [lastTemporaryPassword, setLastTemporaryPassword] = useState('')
  const [form, setForm] = useState<AdminGuestForm>(() => ({
    fullName: '',
    gender: 'male',
    accessCode: 'LIVE-258',
    password: generateGuestPassword(),
    ticketTypeId: featuredEvent.ticketTypes[0]?.id ?? 'general',
  }))
  const [errors, setErrors] = useState<AdminErrors>({})

  const adminGuests = guests.filter((guest) => guest.source === 'admin')
  const seededGuests = guests.filter((guest) => guest.source === 'seed')
  const eventDate = formatEventDate(featuredEvent.date, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
  const guestStats = useMemo(
    () => [
      { label: 'Total guests', value: guests.length },
      { label: 'Admin-created', value: adminGuests.length },
      { label: 'Seed guests', value: seededGuests.length },
    ],
    [adminGuests.length, guests.length, seededGuests.length],
  )

  const updateField = <Field extends keyof AdminGuestForm>(field: Field, value: AdminGuestForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
    setLastTemporaryPassword('')
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const nextSession = await loginAdmin(loginPassword)
      setSession(nextSession)
      window.sessionStorage.setItem(adminSessionStorageKey, JSON.stringify(nextSession))
      setLoginPassword('')
    } catch (error) {
      setLoginError(getErrorMessage(error))
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(adminSessionStorageKey)
    setSession(null)
    setGuests([])
  }, [])

  const refreshGuests = useCallback(async (token = session?.token) => {
    if (!token) {
      return
    }

    setIsLoadingGuests(true)

    try {
      setGuests(await getGuestList(token))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
      } else {
        setErrors({ form: getErrorMessage(error) })
      }
    } finally {
      setIsLoadingGuests(false)
    }
  }, [logout, session?.token])

  useEffect(() => {
    if (!session?.token) {
      return
    }

    const frame = window.setTimeout(() => {
      void refreshGuests(session.token)
    }, 0)

    return () => {
      window.clearTimeout(frame)
    }
  }, [refreshGuests, session?.token])

  const createGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!session?.token) {
      return
    }

    const fullName = form.fullName.trim()
    const accessCode = normalizeInviteCode(form.accessCode)
    const password = form.password.trim()
    const nextErrors: AdminErrors = {}

    if (!fullName) {
      nextErrors.fullName = 'Guest name is required.'
    }

    if (!accessCode) {
      nextErrors.accessCode = 'Invite code is required.'
    }

    if (password.length < 6) {
      nextErrors.password = 'Use at least 6 characters.'
    }

    const isDuplicate = guests.some(
      (guest) => normalizeGuestName(guest.fullName) === normalizeGuestName(fullName) && normalizeInviteCode(guest.accessCode) === accessCode,
    )

    if (isDuplicate) {
      nextErrors.form = 'This guest already has this invite code.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsCreatingGuest(true)

    try {
      const result = await saveAdminGuest(
        {
          fullName,
          gender: form.gender,
          accessCode,
          password,
          ticketTypeId: form.ticketTypeId,
        },
        session.token,
      )
      setForm((current) => ({
        ...current,
        fullName: '',
        password: generateGuestPassword(),
      }))
      setLastTemporaryPassword(result.temporaryPassword)
      setErrors({})
      setGuests(await getGuestList(session.token))
    } catch (error) {
      setErrors({ form: getErrorMessage(error) })
    } finally {
      setIsCreatingGuest(false)
    }
  }

  const removeGuest = async (guestId: string) => {
    if (!session?.token) {
      return
    }

    await deleteAdminGuest(guestId, session.token)
    setGuests(await getGuestList(session.token))
  }

  if (!session) {
    return (
      <main className="bg-black text-white">
        <section className="section-shell grid min-h-[calc(100vh-64px)] place-items-center">
          <form className="grid w-full max-w-lg gap-5 border border-white/18 bg-white p-6 text-black" onSubmit={submitLogin}>
            <div>
              <p className="inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-semibold uppercase text-white">
                <LockKeyhole size={15} />
                Admin only
              </p>
              <h1 className="mt-4 text-4xl font-semibold uppercase leading-none">Guest access dashboard</h1>
              <p className="mt-3 text-sm leading-6 text-black/60">Enter the admin password to manage the guest list.</p>
            </div>
            <AdminField
              error={loginError}
              label="Admin password"
              maxLength={80}
              name="admin-login-password"
              onChange={setLoginPassword}
              placeholder="mzik-admin-dev"
              type="password"
              value={loginPassword}
            />
            <Button className="w-full" disabled={isLoggingIn} type="submit" variant="dark">
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Signing in
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="bg-mzik-stone text-black">
      <section className="section-shell">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-4 max-w-5xl text-5xl font-semibold uppercase leading-[0.9] md:text-7xl">
              Guest access dashboard
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-black/65">
              {featuredEvent.title} / {eventDate} / {featuredEvent.time} / {featuredEvent.venue}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isLoadingGuests} onClick={() => void refreshGuests()} variant="outline">
              {isLoadingGuests ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Refresh
            </Button>
            <Button onClick={logout} variant="dark">
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <form className="grid gap-5 border border-black bg-white p-5 md:p-6" onSubmit={createGuest}>
            <div>
              <p className="inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-semibold uppercase text-white">
                <ShieldCheck size={15} />
                Create guest
              </p>
              <h2 className="mt-4 text-3xl font-semibold uppercase leading-none">Name, code, password</h2>
            </div>

            <AdminField
              error={errors.fullName}
              label="Guest name"
              maxLength={80}
              name="admin-guest-name"
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
                        name="admin-gender"
                        onChange={() => updateField('gender', option.value)}
                        type="radio"
                        value={option.value}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField
                error={errors.accessCode}
                label="Invite code"
                maxLength={24}
                name="admin-code"
                onChange={(value) => updateField('accessCode', value)}
                placeholder="LIVE-258"
                value={form.accessCode}
              />
              <AdminField
                error={errors.password}
                label="Party password"
                maxLength={32}
                name="admin-password"
                onChange={(value) => updateField('password', value)}
                placeholder="TRIUNFO10"
                value={form.password}
              />
            </div>

            <label className="grid gap-2" htmlFor="admin-ticket-type">
              <span className="text-xs font-semibold uppercase text-black/65">Ticket tier</span>
              <select
                className="h-12 border border-black bg-white px-4 text-sm font-semibold uppercase outline-none focus:bg-mzik-lavender/40"
                id="admin-ticket-type"
                onChange={(event) => updateField('ticketTypeId', event.target.value)}
                value={form.ticketTypeId}
              >
                {featuredEvent.ticketTypes.map((ticketType) => (
                  <option key={ticketType.id} value={ticketType.id}>
                    {ticketType.name}
                  </option>
                ))}
              </select>
            </label>

            {errors.form && <p className="border border-mzik-red bg-mzik-red px-4 py-3 text-sm font-semibold text-white">{errors.form}</p>}

            {lastTemporaryPassword && (
              <p className="border border-black bg-mzik-lavender/40 px-4 py-3 text-sm font-semibold text-black">
                Latest password to send: {lastTemporaryPassword}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button disabled={isCreatingGuest} type="submit" variant="dark">
                {isCreatingGuest ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Create guest
              </Button>
              <Button onClick={() => updateField('password', generateGuestPassword())} variant="outline">
                <KeyRound size={16} />
                Generate password
              </Button>
            </div>
          </form>

          <section className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              {guestStats.map((stat) => (
                <div className="border border-black bg-white p-4" key={stat.label}>
                  <p className="text-xs font-semibold uppercase text-black/55">{stat.label}</p>
                  <p className="mt-2 text-4xl font-semibold uppercase">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="border border-black bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-black p-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase">
                  <UsersRound size={18} />
                  Guest list
                </h2>
              </div>
              <div className="grid">
                {guests.map((guest) => (
                  <article className="grid gap-4 border-b border-black p-4 last:border-b-0 xl:grid-cols-[1fr_0.72fr_auto] xl:items-center" key={guest.id}>
                    <div>
                      <p className="text-lg font-semibold uppercase">{guest.fullName}</p>
                      <p className="mt-1 text-xs font-semibold uppercase text-black/50">
                        {formatGender(guest.gender)} / {guest.inviteLabel}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <AccessPill label="Code" value={guest.accessCode} />
                      <AccessPill label="Password" value={guest.passwordStatus} />
                    </div>
                    {guest.source === 'admin' ? (
                      <Button onClick={() => void removeGuest(guest.id)} variant="outline">
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    ) : (
                      <p className="border border-black px-4 py-3 text-center text-xs font-semibold uppercase text-black/55">Seed</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function AdminField({
  error,
  label,
  maxLength,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string
  label: string
  maxLength: number
  name: string
  onChange: (value: string) => void
  placeholder: string
  type?: HTMLInputTypeAttribute
  value: string
}) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <label className="grid gap-2" htmlFor={name}>
      <span className="text-xs font-semibold uppercase text-black/65">{label}</span>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        className="h-12 border border-black bg-white px-4 text-base outline-none transition placeholder:text-black/35 focus:bg-mzik-lavender/40"
        id={name}
        maxLength={maxLength}
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

function AccessPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black px-3 py-2">
      <p className="text-[0.68rem] font-semibold uppercase text-black/45">{label}</p>
      <p className="mt-1 break-all font-semibold">{value}</p>
    </div>
  )
}

function formatGender(gender: GuestGender) {
  const labels: Record<GuestGender, string> = {
    female: 'Female',
    male: 'Male',
    non_binary: 'Non-binary',
    prefer_not_to_say: 'Prefer not to say',
  }

  return labels[gender]
}

function readStoredSession() {
  try {
    const rawSession = window.sessionStorage.getItem(adminSessionStorageKey)

    if (!rawSession) {
      return null
    }

    const session = JSON.parse(rawSession) as AdminSession

    if (!session.token || !session.expiresAt || Date.now() >= new Date(session.expiresAt).getTime()) {
      window.sessionStorage.removeItem(adminSessionStorageKey)
      return null
    }

    return session
  } catch {
    return null
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}
