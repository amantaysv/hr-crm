export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days < 30) {
    return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`
  }

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function isRecent(iso: string, days = 3) {
  const diffDays =
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < days
}
