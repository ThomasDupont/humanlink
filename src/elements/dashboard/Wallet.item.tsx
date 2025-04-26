import { trpc } from '@/utils/trpc'
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { format } from 'date-fns'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { SupportedLocale } from '@/config'
import { TransactionType } from '@prisma/client'
import Link from 'next/link'

const rules: Record<TransactionType, '+' | '-'> = {
  [TransactionType.acceptOffer]: '-',
  [TransactionType.transfertToSellerBalance]: '+',
  [TransactionType.transfertToBuyerBalance]: '+',
  [TransactionType.fees]: '-',
  [TransactionType.cancelOffer]: '+'
}
const Transactions = ({ locale }: { locale: SupportedLocale }) => {
  const { t } = useTranslation('dashboard')

  const { data: transactions } = trpc.protectedGet.getUserTransactions.useQuery()

  const parseAmount = (type: TransactionType, amount: number) => {
    return `${rules[type]} ${amount / 100} €`
  }

  const parsedCreatedDate = (createdAt: string) =>
    format(new Date(createdAt), 'PPP', {
      locale: localeToDateFnsLocale(locale)
    })

  return (
    <Box
      display={'flex'}
      flexDirection={'row'}
      justifyContent={'space-around'}
      alignContent={'center'}
      alignItems={'center'}
    >
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        sx={t => ({
          backgroundColor: t.palette.primary[50],
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          width: '80%',
          p: 1
        })}
      >
        <Typography gutterBottom variant="h4" component={'h3'}>
          {t('myTransactions')}
        </Typography>
        <Table
          sx={{
            p: 2
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Offer</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>{parsedCreatedDate(transaction.createdAt)}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  <Link
                    target="_blank"
                    href={`/${locale}/dashboard/detail/offer/${transaction.offerId}`}
                  >
                    Show offer
                  </Link>
                </TableCell>
                <TableCell>{parseAmount(transaction.type, transaction.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

export default function WalletItem({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation('dashboard')

  const { data: balance } = trpc.protectedGet.getUserBalance.useQuery()

  if (!balance) {
    return null
  }

  const parseBalance = () => {
    return `${balance.balance / 100} €`
  }

  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography
        textAlign={'center'}
        variant="h3"
        component={'h2'}
        sx={{
          mb: 2
        }}
      >
        {t('walletManagement')}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-around'}
        alignContent={'center'}
        alignItems={'center'}
        sx={{
          mb: 4
        }}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-around'}
          alignContent={'center'}
          alignItems={'center'}
          sx={t => ({
            backgroundColor: t.palette.primary[50],
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            width: '80%',
            height: 80,
            p: 1
          })}
        >
          <Typography variant="h4" component={'h3'}>
            {t('myBalance')}
          </Typography>

          <Typography variant="h4" component={'h3'}>
            {parseBalance()}
          </Typography>
        </Box>
        {
          // add payout
        }
      </Box>
      <Transactions locale={locale} />
    </Box>
  )
}
