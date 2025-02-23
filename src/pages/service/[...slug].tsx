import { useCheckUrl } from '@/hooks/checkUrl.hook'
import { StyledGrid } from '@/materials/styledElement'
import { ServiceFromDB } from '@/types/Services.type'
import { trpc } from '@/utils/trpc'
import { Container, Grid2 as Grid, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import z from 'zod'

function Service({ userId, serviceId }: { userId: number; serviceId: number }) {
  const { data: user, status } = trpc.get.userById.useQuery(userId)

  if (!user) {
    return <p>Loading...</p>
  }

  if (status === 'error') {
    return <p>Error</p>
  }

  const service: ServiceFromDB | undefined = user.services.find(service => service.id === serviceId)

  if (!service) {
    return <p>Service non trouvé</p>
  }

  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={{ xs: 4, md: 12 }}
        sx={{
          pt: 20
        }}
      >
        <StyledGrid size={{ xs: 12, md: 6 }}>
          <Typography variant="body1" component="h1">
            {service.title}
          </Typography>
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
