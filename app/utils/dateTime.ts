import dayjs from 'dayjs'

/** Formats a Date object to YYYY-MM-DD string format */
export const formatDate = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

/** Converts 24-hour time format (HH:mm) to 12-hour format with AM/PM (e.g., "18:00" -> "6:00 p.m.") */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0', 10)
  const period = hour >= 12 ? 'p.m.' : 'a.m.'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes || '00'} ${period}`
}
