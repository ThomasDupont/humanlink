import { Currency, PriceType } from "@prisma/client"
import { useTranslation } from "next-i18next"

export const useManagePrice = () => {
  const { t } = useTranslation('service')

  const priceCurrencyToDisplayCurrency = (currency: Currency) => {
    const cur = {
      [Currency.EUR]: '{price} €',
      [Currency.USD]: '$ {price}'
    }

    return cur[currency]
  }

  const managePrice = (price: { number: number, currency: Currency, type: PriceType}) => {
    const stringPrice = (price.number / 100).toString()

    switch (price.type) {
      case 'fix':
        return `${t('startFrom')}: ${priceCurrencyToDisplayCurrency(price.currency).replace('{price}', stringPrice)}`
      case 'fixedPerItem':
        return `${t('startFrom')}: ${priceCurrencyToDisplayCurrency(price.currency).replace('{price}', stringPrice)} ${t('perItem')}`
      case 'percent':
        return `${t('feesOf')} ${stringPrice}%`
    }
  }

  return { managePrice, priceCurrencyToDisplayCurrency }
}
