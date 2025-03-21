import { paymentProvider } from '@/config'
import { PatternMatching } from '@/types/utility.type'
import { Stripe } from './Stripe.payment'
import { Props } from './Payment.interface'

const paymentFactory: PatternMatching<{
  [K in paymentProvider]: (props: Props) => JSX.Element
}> = {
  stripe: props => <Stripe {...props} />
}

export default paymentFactory
