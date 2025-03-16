import { Container, Box, Button } from '@mui/material'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { FormEvent, ReactElement } from 'react'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  'pk_test_51Qqw2WCytLamitJxbSpOkfrXeH1NONlnQ3aJSLKBTW8mJe5B1ux92s2tmfqu0rZpSeYzzd9QINyfqEHHxEmL2cPb00rUY1cVUA'
)

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()

    console.log('submit')
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    console.log('stripe')

    const result = await stripe.confirmPayment({
      clientSecret: '',
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/stripe'
      },
      redirect: 'if_required'
    })

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      console.log(result.error.message)
    } else {
      console.log('success')
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
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
      <Button type="submit" variant="outlined" color="primary" disabled={!stripe}>
        Pay
      </Button>
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

export default function Stripe() {
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
        <CheckoutForm />
      </Elements>
    </Base>
  )
}
