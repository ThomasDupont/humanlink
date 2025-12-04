import { Email } from '@mui/icons-material'
import { Avatar, Box, ButtonBase, List, ListItem, styled, Typography } from '@mui/material'
import { signIn } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'

const StyledButton = styled(ButtonBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  border: 'solid 1px',
  borderRadius: `calc(${theme.shape.borderRadius}px)`,
  minWidth: '200px',
  minHeight: '32px',
  '&:hover': {
    backgroundColor: theme.palette.secondary[50]
  }
}))

export default function LoginModal({ callbackUrl }: { callbackUrl?: string }) {
  const { t } = useTranslation('common')
  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography gutterBottom variant="h4" component="p">
        {t('signInSignOut')}
      </Typography>
      <List>
        <ListItem>
          <StyledButton
            onClick={() => signIn('linkedin', callbackUrl ? { callbackUrl } : undefined)}
          >
            <Avatar
              src="/icons/linkedin-48.png"
              sx={{
                width: 24,
                height: 24
              }}
            />{' '}
            &nbsp;&nbsp;{t('withLinkedin')}
          </StyledButton>
        </ListItem>
        <ListItem>
          <StyledButton onClick={() => signIn('github', callbackUrl ? { callbackUrl } : undefined)}>
            <Avatar
              src="/icons/github-48.png"
              sx={{
                width: 24,
                height: 24
              }}
            />{' '}
            &nbsp;&nbsp;{t('withGithub')}
          </StyledButton>
        </ListItem>
        <ListItem>
          <StyledButton onClick={() => signIn('google', callbackUrl ? { callbackUrl } : undefined)}>
            <Avatar
              src="/icons/google-48.png"
              sx={{
                width: 24,
                height: 24
              }}
            />{' '}
            &nbsp;&nbsp;{t('withGoogle')}
          </StyledButton>
        </ListItem>

        <ListItem>
          <Link href="/api/auth/signin">
            <StyledButton>
              <Email /> &nbsp;&nbsp;{t('withEmail')}
            </StyledButton>
          </Link>
        </ListItem>
      </List>
    </Box>
  )
}
