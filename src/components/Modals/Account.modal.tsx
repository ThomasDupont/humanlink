import { Avatar, Box, ButtonBase, List, ListItem, styled, Typography } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { NextAuthJsUser } from '@/types/User.type'
import { Email } from '@mui/icons-material'

const StyledButton = styled(ButtonBase)(({ theme }) => ({
  border: 'solid 1px',
  borderRadius: `calc(${theme.shape.borderRadius}px)`,
  minWidth: '200px',
  minHeight: '32px',
  '&:hover': {
    backgroundColor: theme.palette.secondary[50]
  }
}))

export default function AccountModal({ user }: { user: NextAuthJsUser }) {
  const { t } = useTranslation('common')
  return (
    <Box
      sx={{
        mt: 1,
        mb: 1,
        ml: 2,
        mr: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        alignItems: 'center'
      }}
    >
      <Typography gutterBottom variant="h4" component="p">
        {t('accountManagementTitle')}
      </Typography>
      <Avatar src={user.image} />
      <Typography variant="body1">{user.name}</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Email />
        <Typography variant="body1"> {user.email}</Typography>
      </Box>
      <List>
        <ListItem>
          <StyledButton>{t('myDashboard')}</StyledButton>
        </ListItem>
        <ListItem>
          <StyledButton onClick={() => signOut()}>{t('signOut')}</StyledButton>
        </ListItem>
      </List>
    </Box>
  )
}
