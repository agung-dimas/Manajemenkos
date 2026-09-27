export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

/**
 * Menghitung rentang tanggal sewa presisi (Siklus Tanggal-ke-Tanggal)
 * Contoh: Masuk 30 Sep 2026, 6 Bulan -> "30 Sep 2026 - 30 Mar 2027 (6 Bulan)"
 */
export function getPeriodDateRange(startDate: Date | string, durationMonth: number = 1): {
  label: string
  endDate: Date
  formattedStart: string
  formattedEnd: string
} {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + durationMonth)

  const pad = (n: number) => n.toString().padStart(2, '0')
  const formatShort = (d: Date) => {
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`
  }

  const durationStr = durationMonth === 12
    ? "1 Tahun"
    : durationMonth === 6
      ? "6 Bulan"
      : `${durationMonth} Bulan`

  return {
    label: `${formatShort(start)} - ${formatShort(end)} (${durationStr})`,
    endDate: end,
    formattedStart: formatShort(start),
    formattedEnd: formatShort(end)
  }
}

export function getPeriodLabel(startMonth: number, startYear: number, durationMonth: number = 1, startDay?: number): string {
  if (startDay) {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const startDate = new Date(startYear, startMonth - 1, startDay)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonth)

    const formatShort = (d: Date) => `${pad(d.getDate())} ${MONTHS[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`
    const durationStr = durationMonth === 12 ? "1 Tahun" : `${durationMonth} Bulan`
    return `${formatShort(startDate)} - ${formatShort(endDate)} (${durationStr})`
  }

  if (durationMonth <= 1) {
    return `${MONTHS[startMonth - 1]} ${startYear}`
  }

  const totalMonths = (startYear * 12) + (startMonth - 1) + (durationMonth - 1)
  const endYear = Math.floor(totalMonths / 12)
  const endMonth = (totalMonths % 12) + 1

  const startStr = `${MONTHS[startMonth - 1]} ${startYear}`
  const endStr = `${MONTHS[endMonth - 1]} ${endYear}`

  if (durationMonth === 12) {
    return `${startStr} - ${endStr} (1 Tahun)`
  }

  return `${startStr} - ${endStr} (${durationMonth} Bulan)`
}
