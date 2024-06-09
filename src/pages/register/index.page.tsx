import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Form, FormError, Header, Input } from './styles'
import { ArrowArcRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { api } from '@/lib/axios'
import { AxiosError } from 'axios'
import { NextSeo } from 'next-seo'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'minimum 3 letters' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'letters and hyphen',
    })
    .transform((username) => username.toLocaleLowerCase()),
  name: z.string().min(3, { message: 'the name minimum 3 letters' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })
      await router.push('/register/connect-calendar')
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
        return
      }
      console.error(err)
    }
  }

  return (
    <>
      <NextSeo title="Create an account | Ignite Call" />
      <Container>
        <Header>
          <Heading as="strong">welcome of Ignite Call!</Heading>
          <Text>
            We need some information to create your profile! Ah, you can edit
            this information later.
          </Text>
          <MultiStep size={4} currentStep={1} />
        </Header>
        <Form as="form" onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size="sm">Name of user</Text>
            <Input
              prefix="iginte.com/"
              placeholder="your user"
              {...register('username')}
            />
            {errors.username && (
              <FormError size="sm">{errors.username.message}</FormError>
            )}
          </label>
          <label>
            <Text size="sm">Name Complet</Text>
            <Input placeholder="your name" {...register('name')} />
            {errors.name && (
              <FormError size="sm">{errors.name.message}</FormError>
            )}
          </label>
          <Button type="submit" disabled={isSubmitting}>
            Next pass
            <ArrowArcRight />
          </Button>
        </Form>
      </Container>
    </>
  )
}
