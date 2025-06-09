import { program } from 'commander'
import { closeMilestone } from '../upsert.trpc'

type Options = {
  milestoneId: string
  offerId: string
  userId: string
}
program.option('--milestoneId <number>').option('--offerId <number>').option('--userId <number>')

program.parse()

const { milestoneId, offerId, userId } = program.opts() as Options

closeMilestone({
  milestoneId: Number(milestoneId),
  offerId: Number(offerId),
  userId: Number(userId)
})
  .run()
  .then(() => {
    console.log('Milestone closed successfully')
  })
  .catch(error => {
    console.error('Error closing milestone:', error)
  })
