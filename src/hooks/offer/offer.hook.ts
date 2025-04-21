import config, { SupportedLocale } from '@/config'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { ConcernedOffer } from '@/utils/trpc'
import { format, formatDuration, intervalToDuration } from 'date-fns'

export const useOfferHook = (locale: SupportedLocale, actualDate: Date) => {
  const parseOffer = (offer: ConcernedOffer, userId: number) => {
    const deadline = new Date(offer.deadline)

    return {
      acceptedAt:
        offer.acceptedAt &&
        format(new Date(offer.acceptedAt), 'PPP', {
          locale: localeToDateFnsLocale(locale)
        }),
      offerFrom: offer.userId === userId ? 'me' : 'other',
      isExpired: actualDate > deadline,
      deadline:
        actualDate < deadline
          ? formatDuration(
              intervalToDuration({
                start: actualDate,
                end: deadline
              }),
              {
                delimiter: ', ',
                locale: localeToDateFnsLocale(locale),
                format: ['days', 'hours', 'minutes']
              }
            )
          : 'expired',
      status: offer.isPaid ? 'terminated' : 'active',
      couldAddRendering: !offer.isPaid,
      computedPrice: offer.milestone.reduce(
        (acc, milestone) => acc + milestone.priceMilestone.number,
        0
      ),
      currency: offer.milestone[0]?.priceMilestone.currency ?? config.defaultCurrency
    } as const
  }

  return {
    parseOffer
  }
}
