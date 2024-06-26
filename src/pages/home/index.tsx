import { Heading, Text } from '@ignite-ui/react'
import Image from 'next/image'
import { Container, Hero, Preview } from './styles'

import previewImage from '../../assets/app-preview.png'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'
import { NextSeo } from 'next-seo'

export default function Home() {
  return (
    <>
      <NextSeo
        title="Uncomplicate your schedule | Ignite Call"
        description="Connect your calendar and let people schedule appointments in their free time.."
      />
      <Container>
        <Hero>
          <Heading size="4xl">Uncomplicated scheduling</Heading>
          <Text size="xl">
            Connect your calendar and let people book appointments in your free
            time.
          </Text>
          <ClaimUsernameForm />
        </Hero>
        <Preview>
          <Image
            src={previewImage}
            height={400}
            quality={100}
            priority
            alt="Calendar symbolizing application in operation"
          />
        </Preview>
      </Container>
    </>
  )
}
