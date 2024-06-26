import { Button, Checkbox, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import {
  IntervalItem,
  IntervalBox,
  IntervalsContainer,
  IntervalDay,
  IntervalInputs,
  FormError,
  Input,
} from './styles'
import { ArrowArcRight } from 'phosphor-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getWeekDays } from '@/utils/get-week-days'
import { converTimeStringToMinutes } from '@/utils/conver-time-string-to-minutes'
import { api } from '@/lib/axios'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'you need to select at least one day of the week',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: converTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: converTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message: 'the end time must be at least one time from the start',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const router = useRouter()

  const weekDays = getWeekDays()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const interval = watch('intervals')

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput
    await api.post('/users/time-intervals', {
      intervals,
    })
    await router.push('/register/update-profile')
  }

  return (
    <>
      <NextSeo title="Select your availability | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Almost there!</Heading>
          <Text>
            Define the range of times you are available each day of the week.
          </Text>
          <MultiStep size={4} currentStep={3} />
        </Header>
        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    <Controller
                      name={`intervals.${index}.enabled`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)
                            }}
                            checked={field.value}
                          />
                        )
                      }}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>
                  <IntervalInputs>
                    <Input
                      type="time"
                      step={60}
                      disabled={interval[index].enabled === false}
                      {...register(`intervals.${index}.startTime`)}
                    />
                    <Input
                      type="time"
                      step={60}
                      disabled={interval[index].enabled === false}
                      {...register(`intervals.${index}.endTime`)}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalsContainer>

          {errors.intervals && (
            <FormError size="sm">{errors.intervals.message}</FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Next pass
            <ArrowArcRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
