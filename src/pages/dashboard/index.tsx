import { Spinner } from '@/components/Spinner'
import { PatternMatching } from '@/types/utility.type'
import { Container, Box, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import OrdersItem from '../../elements/dashboard/Orders.item'
import ServicesItem from '../../elements/dashboard/Services.item'
import WalletItem from '../../elements/dashboard/Wallet.item'
import { useAuthSession } from '@/hooks/nextAuth.hook'
import { SupportedLocale } from '@/config'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          pt: 15
        }}
      >
        {children}
      </Box>
    </Container>
  )
}

type Item = 'services' | 'orders' | 'wallet'

const itemMatcher: PatternMatching<{
  [K in Item]: (locale: SupportedLocale) => ReactElement
}> = {
  orders: (locale: SupportedLocale) => <OrdersItem locale={locale} />,
  services: () => <ServicesItem />,
  wallet: (locale: SupportedLocale) => <WalletItem locale={locale} />
}

const MenuItem = ({ title, selected }: { title: string; selected: boolean }) => {
  const { t } = useTranslation('dashboard')
  return (
    <Box
      sx={t => ({
        backgroundColor: selected ? t.palette.secondary[100] : 'inherit',
        p: 1,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: selected ? t.palette.secondary[100] : t.palette.secondary[50]
        }
      })}
    >
      <Typography variant="h3" component={'p'}>
        {t(title)}
      </Typography>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'service'])),
      locale
    }
  }
}

export default function Dashboard({ locale }: { locale: SupportedLocale }) {
  const [selectedItem, setSelectedItem] = useState<Item>()
  const { t } = useTranslation('common')

  const auth = useAuthSession()

  useEffect(() => {
    if (auth.user) {
      setSelectedItem('orders')
    }
  }, [auth.user?.email])

  if (!auth.user && !auth.error) {
    return (
      <Base>
        <Spinner />
      </Base>
    )
  }

  if (auth.error) {
    return (
      <Base>
        <Typography
          align="center"
          variant="h1"
          sx={{
            mb: 10
          }}
        >
          {t('401errors')}
        </Typography>
      </Base>
    )
  }

  return (
    <Base>
      <>
        <Typography textAlign={'center'} gutterBottom variant="h2" component={'h1'}>
          Dashboard
        </Typography>
        <Box
          sx={t => ({
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            boxShadow: t.shadows[1],
            backgroundColor: 'white',
            minHeight: 620,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          })}
        >
          <Box
            id="menu"
            sx={t => ({
              borderRight: `solid 1px ${t.palette.secondary[100]}`
            })}
          >
            {Object.keys(itemMatcher).map(item => (
              <Box onClick={() => setSelectedItem(item as Item)} key={item}>
                <MenuItem selected={selectedItem === item} title={item} />
              </Box>
            ))}
          </Box>
          <Box width={'100%'} id="main">
            {selectedItem && itemMatcher[selectedItem](locale)}
          </Box>
        </Box>
      </>
    </Base>
  )
}
