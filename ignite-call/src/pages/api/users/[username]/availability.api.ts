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
    return res.json({
      availability: [],
    })
  }
  // aqui to buscando no banco de dados, o userTimeIntervals ou seja o intervalo de tempo que usuario vai estar diponivels, onde o dia da semana bate extamente com a data, chamando essa rota de disponibilidade : week_day: referenceDate.get('day'), bucando na data especifica
  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    return res.json({
      availability: [],
    })
  }

  // aqui determino que e de houra em houra, nao vai poder ser de numero quebrado smepre de 1 hora para 1 houra.
  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  // aqui faca para mostra todas as houras disponiveis
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i
    },
  )

  return res.json({ possibleTimes })
}
