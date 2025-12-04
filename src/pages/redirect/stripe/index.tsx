import { Spinner } from '@/components/Spinner'
import { useAuthSession } from '@/hooks/nextAuth.hook'
import { trpc } from '@/utils/trpc'
import { Container, Box, Typography } from '@mui/material'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import { z } from 'zod'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20
        }}
      >
        {children}
      </Box>
    </Container>
  )
}

const qsValidator = z.object({
  paymentId: z.string(),
  offerId: z.string()
})

const Proceed = ({ query }: { query: z.infer<typeof qsValidator> }) => {
  const { mutateAsync } = trpc.protectedMutation.offer.accept.useMutation()
  const [showSpinner, setShowSpinner] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    mutateAsync({
      offerId: parseInt(query.offerId),
      paymentProvider: 'stripe',
      paymentId: query.paymentId
    })
      .catch(error => {
        console.warn('Error accepting offer:', error)
        setError(error.message)
      })
      .finally(() => {
        setShowSpinner(false)
      })
  }, [query])

  if (showSpinner) {
    return (
      <Base>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <Spinner />
        </Box>
      </Base>
    )
  }

  if (error) {
    return (
      <Base>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <Typography variant="h4" color="error" component="p">
            {error}
          </Typography>
        </Box>
      </Base>
    )
  }

  return (
    <Base>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Link href={`/dashboard/detail/offer/${query.offerId}`}>Go bask to offer</Link>
      </Box>
    </Base>
  )
}

export default function StripeRedirect() {
  const router = useRouter()
  const { user } = useAuthSession()

  if (!user) {
    return <p>Not connected</p>
  }

  const parsedQuery = qsValidator.safeParse(router.query)

  if (parsedQuery.error) {
    return notFound()
  }

  return <Proceed query={parsedQuery.data} />
}
