import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { ArrowArcRight, Check } from 'phosphor-react'
// import { api } from '@/lib/axios'
import { AuthError, ConnectBox, ConnectItem } from './styles'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = !!router.query.error
  const isSignedIn = session.status === 'authenticated'

  async function handleConnectCalendar() {
    await signIn('google')
  }

  async function handleNavigateToNextStep() {
    await router.push('/register/time-intervals')
  }

  return (
    <>
      <NextSeo title="Connect your Google Calendar | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Connect your calendar!</Heading>
          <Text>
            Conecte o seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medida em que são agendados.
          </Text>
          <MultiStep size={4} currentStep={2} />
        </Header>
        <ConnectBox>
          <ConnectItem>
            <Text>Google Calendar</Text>
            {isSignedIn ? (
              <Button size="sm" disabled>
                connected
                <Check />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleConnectCalendar}
              >
                Conectar
                <ArrowArcRight />
              </Button>
            )}
          </ConnectItem>
          {hasAuthError && (
            <AuthError size="sm">
              Failed to connect with Google, check if you have enabled Google
              Calendar access permissions
            </AuthError>
          )}
          <Button
            onClick={handleNavigateToNextStep}
            type="submit"
            disabled={!isSignedIn}
          >
            Next pass
            <ArrowArcRight />
          </Button>
        </ConnectBox>
      </Container>
    </>
  )
}
