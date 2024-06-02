import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  const username = String(req.query.username)
  const { date } = req.query
  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
  }
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({
      message: 'User does not exist.',
    })
  }
  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }
  // aqui to buscando no banco de dados, o userTimeIntervals ou seja o intervalo de tempo que usuario vai estar diponivels, onde o dia da semana bate extamente com a data, chamando essa rota de disponibilidade : week_day: referenceDate.get('day'), bucando na data especifica
  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }
  // aqui determino que e de houra em houra, nao vai poder ser de numero quebrado smepre de 1 hora para 1 houra.
  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  const startHour = time_start_in_minutes / 60 // hora que comerca 10:00
  const endHour = time_end_in_minutes / 60 // hora que termina 18:00

  // aqui faca para mostra todas as houras disponiveis
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

  // aqui pego todos os horarios disponivel, e validar que nao existe agendamento nesse horario
  const availableTimes = possibleTimes.filter((time) => {
    const isTimeBlocked = !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
    const isTimeInPast = referenceDate.set('hour', time).isBefore(new Date())
    return !isTimeBlocked && !isTimeInPast
  })

  return res.json({ possibleTimes, availableTimes })
}
