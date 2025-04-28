import { useAuthSession } from '@/hooks/nextAuth.hook'
import { trpc } from '@/utils/trpc'
import { Container, Box } from '@mui/material'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'
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

  useEffect(() => {
    mutateAsync({
      offerId: parseInt(query.offerId),
      paymentProvider: 'stripe',
      paymentId: query.paymentId
    })
  }, [query])

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
        <h1>Payment successful</h1>
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
