import { Box, Button, Container, Typography } from '@mui/material'
import { Props } from './Payment.interface'
import { trpc } from '@/utils/trpc'
import { FormEvent, ReactElement, useState } from 'react'
import { loadStripe, StripeError } from '@stripe/stripe-js'
import { env } from '@/server/env'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(env.STRIPE_API_KEY_PUBLIC)

const CheckoutForm = ({ offer, closeWithResult }: Props) => {
  const stripe = useStripe()
  const elements = useElements()
  const { mutateAsync } = trpc.protectedMutation.payment.stripe.createPaymentIntent.useMutation()

  const [paymentError, setPaymentError] = useState<StripeError>()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    mutateAsync({
      type: 'offer',
      offerId: offer.id
    })
      .then(data => {
        console.log('submit')
        if (!stripe || !elements) {
          return
        }

        console.log('stripe')

        return stripe.confirmPayment({
          clientSecret: data.secret,
          elements,
          confirmParams: {
            return_url: 'http://localhost:3000/stripe'
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
      <Button type="submit" variant="outlined" color="primary" disabled={!stripe} sx={{ mt: 2 }}>
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
          pt: 20
        }}
      >
        {children}
      </Box>
    </Container>
  )
}

export const Stripe = (props: Props) => {
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
          amount: 1099,
          currency: 'usd'
        }}
      >
        <CheckoutForm {...props} />
      </Elements>
    </Base>
  )
}
