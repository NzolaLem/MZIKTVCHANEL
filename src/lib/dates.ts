const defaultLocale = 'en'

export function formatEventDate(date: string, options: Intl.DateTimeFormatOptions, fallback = 'Date TBA') {
  const parsedDate = parseEventDate(date)

  if (!parsedDate) {
    return fallback
  }

  return new Intl.DateTimeFormat(defaultLocale, options).format(parsedDate)
}

export function formatTicketStubDate(date: string) {
  const parsedDate = parseEventDate(date)

  if (!parsedDate) {
    return 'TBA'
  }

  return new Intl.DateTimeFormat(defaultLocale, {
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate).replace('/', ' / ')
}

function parseEventDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}
