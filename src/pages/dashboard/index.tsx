import { Container, Box, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement, useState } from 'react'

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
    item: Item.SERVICES,
    freelanceOnly: true
  },
  {
    item: Item.ORDERS,
    freelanceOnly: false
  },
  {
    item: Item.WALLET,
    freelanceOnly: true
  }
]

const MenuItem = ({ title, selected }: { title: string; selected: boolean }) => {
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
        {title}
      </Typography>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      locale
    }
  }
}

export default function Dashboard() {
  const [selectedItem, setSelectedItem] = useState<Item>()
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
              width: '10%',
              borderRight: `solid 1px ${t.palette.secondary[100]}`
            })}
          >
            {dashboardViews.map(item => (
              <Box onClick={() => setSelectedItem(item.item)} key={item.item}>
                <MenuItem selected={selectedItem === item.item} title={item.item} />
              </Box>
            ))}
          </Box>
          <Box id="main"></Box>
        </Box>
      </>
    </Base>
  )
}
