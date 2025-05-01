import { Box, Button, Container, Typography } from '@mui/material'
import { Props } from './Payment.interface'
import { trpc } from '@/utils/trpc'
import { FormEvent, ReactElement, useEffect, useState } from 'react'
import { loadStripe, Stripe as StripeType, StripeError } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import config from '@/config'

const CheckoutForm = ({
  offer,
  closeWithResult,
  idempotencyKey
}: Props & { idempotencyKey: string }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { mutateAsync } = trpc.protectedMutation.payment.stripe.createPaymentIntent.useMutation()

  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return ''
  }

  const [paymentError, setPaymentError] = useState<StripeError>()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    mutateAsync({
      type: 'offer',
      offerId: offer.id,
      idempotencyKey
    })
      .then(async data => {
        if (!stripe || !elements) {
          return
        }

        await elements.submit()

        return stripe.confirmPayment({
          clientSecret: data.secret,
          elements,
          confirmParams: {
            return_url: `${getAppUrl()}/redirect/stripe?paymentId=${data.id}&offerId=${offer.id}`
          },
          redirect: 'if_required'
        })
      })
      .then(result => {
        if (!result) {
          return
        }
        if (result.error) {
          setPaymentError(result.error)
        } else {
          closeWithResult({
            success: true,
            providerPaymentId: result.paymentIntent.id,
            provider: 'stripe'
          })
        }
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true
          },
          paymentMethodOrder: ['card', 'paypal', 'klarna']
        }}
      />
      <Button type="submit" variant="contained" color="primary" disabled={!stripe} sx={{ mt: 2 }}>
        Pay
      </Button>
      {paymentError && (
        <Box
          sx={{
            mt: 2
          }}
        >
          <Typography variant="body2" color={'error'}>
            {paymentError.message}
          </Typography>
        </Box>
      )}
    </form>
  )
}

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 2,
          pb: 2
        }}
      >
        {children}
      </Box>
    </Container>
  )
}

export const Stripe = (props: Props) => {
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string>('')

  const computedAmount = props.offer.milestones.reduce(
    (acc, milestone) => acc + milestone.priceMilestone.number,
    0
  )
  const currency = props.offer.milestones[0]?.priceMilestone.currency ?? config.defaultCurrency

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY_PUBLIC!))
    setIdempotencyKey(Math.random().toString(36).substring(7))
  }, [])
  return (
    <Base>
      <Elements
        stripe={stripePromise}
        options={{
          appearance: {
            theme: 'flat',
            variables: { colorPrimaryText: '#397ff8' }
          },
          mode: 'payment',
          amount: computedAmount,
          currency: currency.toLowerCase()
        }}
      >
        <CheckoutForm idempotencyKey={idempotencyKey} {...props} />
      </Elements>
    </Base>
  )
}
