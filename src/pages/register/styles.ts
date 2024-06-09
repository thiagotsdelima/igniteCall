import { Box, Heading, Text, styled } from '@ignite-ui/react'

export const Container = styled('main', {
  maxWidth: 572,
  margin: '$20 auto $4',
  padding: '0 $4',
})
export const Header = styled('div', {
  padding: '0 $6',
  [`> ${Heading}`]: {
    lineHeight: '$base',
  },
  [`> ${Text}`]: {
    color: '$gray200',
    marginBottom: '$6',
  },
})
export const Form = styled(Box, {
  marginTop: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '$2',
  },
})
export const FormError = styled(Text, {
  color: '#f75a68',
})
export const Input = styled('input', {
  fontFamily: '$default',
  fontSize: '$sm',
  color: '$white',
  fontWeight: 'regular',
  background: 'transparent',
  border: 0,
  width: '100%',
  '&:focus': {
    outline: 0,
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
  '&::placeholder': {
    color: '$gray400',
  },
})
