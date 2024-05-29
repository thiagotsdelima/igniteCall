export function getWeekDays() {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
  return Array.from(Array(7).keys())
    .map((day) => formatter.format(new Date(Date.UTC(2021, 5, day))))
    .map((weekDays) => {
      return weekDays
        .substring(0, 1)
        .toUpperCase()
        .concat(weekDays.substring(1))
    })
}
