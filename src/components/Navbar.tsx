import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import {
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Divider,
  Drawer,
  Box,
  Typography,
  Avatar
} from '@mui/material'
import { AccountCircle, Menu as MenuIcon, Message, NotificationsRounded } from '@mui/icons-material'
import { CloseRounded as CloseRoundedIcon } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: 'white',
  boxShadow: theme.shadows[1],
  padding: '8px 12px'
}))

const SmallAvatar = styled(Avatar)(() => ({
  width: 24,
  height: 24
}))

const Icons = ({ mobile }: { mobile: boolean }) => {
  const { data: session } = useSession()

  return (
    <Box
      sx={{
        display: mobile ? { xs: 'block', md: 'none' } : { xs: 'none', md: 'block' }
      }}
    >
      <IconButton>
        <NotificationsRounded color="secondary" fontSize="medium" />
      </IconButton>
      <IconButton>
        <Message color="secondary" fontSize="medium" />
      </IconButton>
      <IconButton>
        {session ? (
          <SmallAvatar src={session?.user?.image ?? undefined} />
        ) : (
          <AccountCircle color="secondary" fontSize="medium" />
        )}
      </IconButton>
    </Box>
  )
}

const Title = () => {
  return (
    <Link href="/">
      <Typography color="primary" fontWeight={700} variant="h5" component="p">
        HumanLink
      </Typography>
    </Link>
  )
}

export default function Header() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  const { pathname } = useRouter()

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <AppBar
      component={'header'}
      color="transparent"
      sx={{
        boxShadow: 0,
        mt: 'calc(var(--template-frame-height, 0px) + 28px)'
      }}
    >
      <Container maxWidth="xl">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', px: 4 }}
          >
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              <Title />
              <Box sx={{ pt: '4px' }}>
                <Typography color="secondary" variant="body1" component="p">
                  {t('navbarHeadline')}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Icons mobile={false} />
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'space-between',
              gap: 12,
              width: '100%'
            }}
          >
            <Link href="/">
              <Typography
                sx={{ pt: '4px' }}
                color="primary"
                fontWeight={700}
                variant="h5"
                component="p"
              >
                HumanLink
              </Typography>
            </Link>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon color="secondary" />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)'
                }
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Title />
                <Divider sx={{ my: 4 }} />
                <Icons mobile={true} />
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  )
}
