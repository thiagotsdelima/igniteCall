import { Button, Text, TextArea, TextInput } from '@ignite-ui/react'
import { ConfirmForm, FormActions, FormError, FormHeader } from './styles'
import { CalendarBlank, Clock } from 'phosphor-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { api } from '@/lib/axios'
import { useRouter } from 'next/router'
import { toast } from 'sonner'

const confirmFormSchema = z.object({
  name: z.string().min(3, { message: 'name needs at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  observations: z.string().nullable(),
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>

interface ConfirmStepProps {
  schedulingDate: Date
  onCancelConfirmation: () => void
}

export function ConfirmStep({
  schedulingDate,
  onCancelConfirmation,
}: ConfirmStepProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  })

  const router = useRouter()
  const username = String(router.query.username)

  async function handleConfirmScheduling(data: ConfirmFormData) {
    const { name, email, observations } = data

    try {
      await api.post(`/users/${username}/schedule`, {
        name,
        email,
        observations,
        date: schedulingDate,
      })

      const describedDate = dayjs(schedulingDate).format(
        'DD[ of ]MMMM[ of ]YYYY',
      )
      const describedTime = dayjs(schedulingDate).format('HH:mm[h]')

      setTimeout(() => {
        toast.success(`Schedule made ${describedDate} at ${describedTime}`)
        onCancelConfirmation()
      }, 2000)
    } catch (error) {
      toast.error('An error occurred while scheduling.')
    }
  }

  const describedDate = dayjs(schedulingDate).format('DD[ of ]MMMM[ of ]YYYY')
  const describedTime = dayjs(schedulingDate).format('HH:mm[h]')

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {describedDate}
        </Text>
        <Text>
          <Clock />
          {describedTime}
        </Text>
      </FormHeader>
      <label>
        <Text size="sm">Name Complet</Text>
        <TextInput placeholder="You Name" {...register('name')} />
        {errors.name && <FormError size="sm">{errors.name.message}</FormError>}
      </label>
      <label>
        <Text size="sm">Adress of email</Text>
        <TextInput
          type="email"
          placeholder="jhondoe@example.com"
          {...register('email')}
        />
        {errors.email && (
          <FormError size="sm">{errors.email.message}</FormError>
        )}
      </label>
      <label>
        <Text size="sm">observations</Text>
        <TextArea {...register('observations')} />
      </label>
      <FormActions>
        <Button type="button" variant="tertiary" onClick={onCancelConfirmation}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Confirm
        </Button>
      </FormActions>
    </ConfirmForm>
  )
}
