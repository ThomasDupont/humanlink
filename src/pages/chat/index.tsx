import {
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/router'
import { z } from 'zod'
import { useAuthSession } from '@/hooks/nextAuth.hook'
import { trpc } from '../../utils/trpc'
import { Send } from '@mui/icons-material'
import { useState } from 'react'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'chat']))
    }
  }
}

const qsValidator = z.object({
  userId: z
    .string()
    .transform(id => parseInt(id, 10))
    .optional(),
  serviceId: z
    .string()
    .transform(id => parseInt(id, 10))
    .optional()
})

const Conversation = ({ userId }: { userId: number }) => {
  const { data: user } = trpc.get.userById.useQuery(userId)
  const [message, setMessage] = useState<string>()

  return (
    user && (
      <Box
        sx={t => ({
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: 'white',
          height: 620,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        })}
      >
        <Box id="head">
          <Box
            sx={{
              m: 2,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 4
            }}
          >
            <Avatar src={user.image ?? undefined} />
            <Box>
              <Typography variant="body1">
                {user.firstname} {user.lastname}
              </Typography>
              <Typography variant="body2">{user.jobTitle}</Typography>
            </Box>
          </Box>
          <Divider />
        </Box>
        <Box id="main"></Box>
        <Box
          id="footer"
          sx={{
            height: 100
          }}
        >
          <Divider />
          <Box
            sx={{
              width: '100%',
              pl: 4,
              pr: 4
            }}
          >
            <TextField
              type="textarea"
              variant="standard"
              color="primary"
              label={'Votre message'}
              onChange={e => setMessage(e.target.value)}
              value={message}
              multiline
              fullWidth
              minRows={1}
              slotProps={{
                input: {
                  spellCheck: 'false',
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        mr: 1
                      }}
                    >
                      <IconButton type="submit" edge="end">
                        <Send
                          fontSize="medium"
                          sx={t => ({
                            color: t.palette.primary.main
                          })}
                        />
                      </IconButton>
                    </InputAdornment>
                  )
                },
                htmlInput: { maxLength: 200 }
              }}
            />
          </Box>
        </Box>
      </Box>
    )
  )
}

const Contacts = () => {
  return <></>
}

export default function Chat() {
  const router = useRouter()
  const { connectedStatus } = useAuthSession()

  if (connectedStatus === 'unauthenticated') {
    return <p>Not connected</p>
  }

  const parsedQuery = qsValidator.safeParse(router.query)

  if (parsedQuery.error) {
    return notFound()
  }

  const conversationWithUserId = parsedQuery.data.userId

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20,
          pb: 10
        }}
      >
        <Contacts />
        {conversationWithUserId && <Conversation userId={conversationWithUserId} />}
      </Box>
    </Container>
  )
}
