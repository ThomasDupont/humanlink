import { useCheckUrl } from '@/hooks/checkUrl.hook'
import { StyledBadge, StyledGrid } from '@/materials/styledElement'
import { ServiceFromDB } from '@/types/Services.type'
import { trpc } from '@/utils/trpc'
import { Payment, Schedule, TipsAndUpdates, Verified } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Container,
  Divider,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  Typography
} from '@mui/material'
import { Currency, Price } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import z from 'zod'

const managePrice = (price: Price) => {
  const priceCurrencyToDisplayCurrency = (currency: Currency) => {
    const cur = {
      [Currency.EUR]: '{price} €',
      [Currency.USD]: '$ {price}'
    }

    return cur[currency]
  }

  const stringPrice = (price.number / 100).toString()

  switch (price.type) {
    case 'fix':
      return `À partir de : ${priceCurrencyToDisplayCurrency(price.currency).replace('{price}', stringPrice)}`
    case 'fixedPerItem':
      return `À partir de : ${priceCurrencyToDisplayCurrency(price.currency).replace('{price}', stringPrice)} par réalisation`
    case 'percent':
      return `Commission de ${stringPrice}%`
  }
}

function Service({ userId, serviceId }: { userId: number; serviceId: number }) {
  const { data: user, status } = trpc.get.userById.useQuery(userId)

  if (!user) {
    return <p>Loading...</p>
  }

  if (status === 'error') {
    return <p>Error</p>
  }

  const service: ServiceFromDB | undefined = user.services.find(
    (service: ServiceFromDB) => service.id === serviceId
  )

  if (!service) {
    return <p>Service non trouvé</p>
  }

  const price = managePrice(service.prices[0])

  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={{ xs: 4, md: 12 }}
        sx={{
          pt: 20
        }}
      >
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            mb: 10
          }}
        >
          <Typography gutterBottom variant="h3" component="h1">
            {service.title}
          </Typography>
          <Typography gutterBottom variant="body1">
            {service.descriptionShort}
          </Typography>
          <Divider
            sx={{
              m: 4
            }}
          />
          <Stack direction="row" spacing={2}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar alt={`${user.firstname} ${user.lastname}`} src={user.image ?? undefined} />
            </StyledBadge>
            <Box>
              <Stack direction="row" spacing={2}>
                <Typography variant="body1">{`${user.firstname} ${user.lastname}`}</Typography>
                <Verified
                  sx={{
                    color: 'primary.dark'
                  }}
                />
              </Stack>
              <Typography variant="body2">{user.description}</Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent={'space-between'}
            sx={{
              mt: 4
            }}
          >
            <Typography variant="body2">Langues : {service.langs.join(' | ')}</Typography>
            <Typography variant="body2">#{service.category}</Typography>
          </Stack>
          <CardMedia
            component="img"
            image={`https://picsum.photos/1000/625?random=${service.id}`}
            alt="service"
            sx={t => ({
              mt: 4,
              borderRadius: `calc(${t.shape.borderRadius}px + 8px)`
            })}
          />
          <Typography
            variant="body1"
            sx={{
              mt: 4
            }}
          >
            {service.description}
          </Typography>
        </Grid>
        <StyledGrid
          size={{ xs: 12, md: 4 }}
          sx={t => ({
            mb: 10,
            position: 'sticky',
            top: 160,
            maxHeight: '500px',
            '&:hover': {
              boxShadow: t.shadows[1]
            }
          })}
        >
          <Typography variant="h4" component="p">
            {price}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdates />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                Prix et commissions négociables avec le prestataire
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                Répond en moins de 12 heures
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Payment />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                Paiement après validation de la prestation
              </Typography>
            </ListItem>
          </List>
          <Button variant="contained">Prendre contact</Button>
        </StyledGrid>
      </Grid>
    </Container>
  )
}

const urlParamsCodec = z.tuple([z.string(), z.string(), z.coerce.number(), z.coerce.number()])

export default function DecodeParam() {
  const { validateUrlParam } = useCheckUrl(urlParamsCodec)
  const [ids, setids] = useState<[number, number]>()
  const router = useRouter()

  useEffect(() => {
    const params = validateUrlParam(location.pathname)

    if (params.success) {
      setids(params.data.slice(params.data.length - 2) as [number, number])
    } else {
      router.push('/404')
    }
  }, [])

  if (!ids) {
    return <p>Loading...</p>
  }

  const [userId, serviceId] = ids

  return <Service userId={userId} serviceId={serviceId} />
}
