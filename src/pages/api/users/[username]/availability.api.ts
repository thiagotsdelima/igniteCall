import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextApiRequest, NextApiResponse } from 'next'

dayjs.extend(utc)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { date, timezoneOffset } = req.query

  if (
    typeof username !== 'string' ||
    typeof date !== 'string' ||
    typeof timezoneOffset !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid parameters' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  // aqui verifico se o horario ja passou,s e sim deixa disabilitado
  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability
  // se a marcacao de hora, nao for de hora em hora, devo mudar aqui
  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60
  // aqui verifico os horarios disponiveis
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i
    },
  )
  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  })

  const availableTimes = possibleTimes.filter((time) => {
    const isTimeBlocked = blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )

    const isTimeInPast = referenceDate.set('hour', time).isBefore(new Date())

    return !isTimeBlocked && !isTimeInPast
  })

  return res.json({ possibleTimes, availableTimes })
}
