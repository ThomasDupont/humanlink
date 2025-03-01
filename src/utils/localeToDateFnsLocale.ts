import { SuportedLocale } from '@/config'
import * as fnsLocale from 'date-fns/locale'

export const localeToDateFnsLocale = (locale: SuportedLocale) => {
  const matching = {
    en: fnsLocale.enUS,
    fr: fnsLocale.fr
  }

  return matching[locale]
}
