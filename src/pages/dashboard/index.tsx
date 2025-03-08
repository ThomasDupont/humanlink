import { Spinner } from '@/components/Spinner'
import { PatternMatching } from '@/types/utility.type'
import { Container, Box, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import OrdersItem from './Orders.item'
import ServicesItem from './Services.item'
import WalletItem from './Wallet.item'
import { useAuthSession } from '@/hooks/nextAuth.hook'

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

enum Item {
  SERVICES = 'services',
  ORDERS = 'orders',
  WALLET = 'wallet'
}

const dashboardViews = [
  {
    item: Item.ORDERS,
    freelanceOnly: false
  },
  {
    item: Item.SERVICES,
    freelanceOnly: true
  },
  {
    item: Item.WALLET,
    freelanceOnly: true
  }
]

const itemMatcher: PatternMatching<{
  [K in Item]: () => ReactElement
}> = {
  [Item.ORDERS]: () => <OrdersItem />,
  [Item.SERVICES]: () => <ServicesItem />,
  [Item.WALLET]: () => <WalletItem />
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

export default function Dashboard() {
  const [selectedItem, setSelectedItem] = useState<Item>()
  const { t } = useTranslation('common')

  const auth = useAuthSession()

  useEffect(() => {
    if (auth.user) {
      setSelectedItem(auth.user.isFreelance ? Item.SERVICES : Item.ORDERS)
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
            {dashboardViews.map(item => {
              if (item.freelanceOnly && auth.user.isFreelance) {
                return (
                  <Box onClick={() => setSelectedItem(item.item)} key={item.item}>
                    <MenuItem selected={selectedItem === item.item} title={item.item} />
                  </Box>
                )
              } else if (!item.freelanceOnly) {
                return (
                  <Box onClick={() => setSelectedItem(item.item)} key={item.item}>
                    <MenuItem selected={selectedItem === item.item} title={item.item} />
                  </Box>
                )
              }
            })}
          </Box>
          <Box width={'100%'} id="main">
            {selectedItem && itemMatcher[selectedItem]()}
          </Box>
        </Box>
      </>
    </Base>
  )
}
