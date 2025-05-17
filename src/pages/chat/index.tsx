import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
import { Refresh, Send } from '@mui/icons-material'
import { FormEvent, useState, KeyboardEvent } from 'react'
import { useConversation } from '@/hooks/chat/conversation.hook'
import { Spinner } from '@/components/Spinner'
import config, { SupportedLocale } from '@/config'
import BaseModal from '@/components/BaseModal'
import CreateOfferModal from '@/components/Modals/CreateOffer.modal'
import { useTranslation } from 'next-i18next'
import ShowOffer from '@/elements/chat/ShowOffer.element'
import { UserWithServicesWithPrices } from '@/types/User.type'
import { logger } from '@/server/logger'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'chat', 'service'])),
      locale
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

const Conversation = ({
  conversationWithUserId,
  locale,
  iAmAFreelance
}: {
  conversationWithUserId: number
  locale: SupportedLocale
  iAmAFreelance: boolean
  serviceId?: number
}) => {
  const { t } = useTranslation('chat')
  const {
    data: user,
    isFetching,
    status,
    error
  } = trpc.get.userById.useQuery(conversationWithUserId)
  const [message, setMessage] = useState<string>()
  const [openCreateOfferModal, setOpenCreateOfferModal] = useState(false)

  const { mutateAsync } = trpc.protectedMutation.sendMessage.useMutation()

  const { queue, refetch } = useConversation(conversationWithUserId)

  const handleSubmitMessage = (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (!message) {
      return
    }

    mutateAsync({
      receiverId: conversationWithUserId,
      message
    }).then(() => {
      refetch()
      setMessage('')
    })
  }

  if (status === 'error') {
    logger.error({
      error: 'trpcError',
      message: error.message,
      errorDetail: error
    })
    return <Typography variant="body1">{error.message}</Typography>
  }

  if (isFetching) {
    return <Spinner />
  }

  return (
    user && (
      <Box
        sx={t => ({
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper,
          height: 620,
          width: '85%',
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
        <Box
          id="main"
          sx={{
            height: '100%',
            m: 2,
            overflow: 'scroll'
          }}
        >
          <Box>
            {[...queue].reverse().map(message => {
              return (
                <Box
                  key={message.id}
                  display={'flex'}
                  flexDirection={'row'}
                  justifyContent={
                    message.receiverId === conversationWithUserId ? 'flex-end' : 'flex-start'
                  }
                  sx={{
                    mt: 1,
                    mb: 1
                  }}
                >
                  {message.offer ? (
                    <ShowOffer
                      offer={message.offer}
                      user={user}
                      locale={locale}
                      userIdFromAuth={message.receiverId}
                      onAcceptEvent={() => {
                        refetch()
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={t => ({
                        whiteSpace: 'pre-line',
                        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
                        boxShadow: t.shadows[1],
                        textAlign: 'left',
                        backgroundColor: t.palette.secondary[100],
                        padding: 1
                      })}
                    >
                      {message.message}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>
        <Box
          id="footer"
          sx={{
            height: 208
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
            <form onSubmit={handleSubmitMessage}>
              <TextField
                type="textarea"
                variant="standard"
                color="primary"
                label={t('yourMessage')}
                onChange={e => setMessage(e.target.value)}
                value={message}
                helperText={`${message?.length ?? 0} / ${config.userInteraction.messageMaxLen}`}
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
                        <IconButton onClick={() => refetch()} edge="end">
                          <Refresh />
                        </IconButton>
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
                  htmlInput: { maxLength: config.userInteraction.messageMaxLen }
                }}
              />
            </form>
            {iAmAFreelance && (
              <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}>
                <Button onClick={() => setOpenCreateOfferModal(true)} variant="outlined">
                  Proposer une offre
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        <BaseModal open={openCreateOfferModal} handleClose={() => setOpenCreateOfferModal(false)}>
          <CreateOfferModal
            handleClose={() => {
              refetch()
              setOpenCreateOfferModal(false)
            }}
            receiverId={conversationWithUserId}
          />
        </BaseModal>
      </Box>
    )
  )
}

const Contacts = ({
  onContactClick,
  userId
}: {
  onContactClick: (id: number) => void
  userId?: number
}) => {
  const { data: contacts } = trpc.protectedGet.getContacts.useQuery()
  const [selected, setSelected] = useState(userId)

  return (
    <Box
      sx={t => ({
        width: '15%',
        height: 620,
        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
        boxShadow: t.shadows[1],
        backgroundColor: t.palette.background.paper,
        pt: 1,
        overflow: 'scroll'
      })}
    >
      {contacts ? (
        <>
          <Typography textAlign={'center'} variant="h4" component={'p'}>
            Contacts
          </Typography>
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {contacts.map(contact => (
              <ListItem
                onClick={() => {
                  setSelected(contact.id)
                  onContactClick(contact.id)
                }}
                alignItems="flex-start"
                key={contact.id}
                sx={t => ({
                  backgroundColor:
                    selected === contact.id ? t.palette.secondary[50] : t.palette.background.paper
                })}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={`${contact.firstname} ${contact.lastname}`}
                    src={contact.image ?? undefined}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${contact.firstname} ${contact.lastname}`}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'text.primary', display: 'inline' }}
                    >
                      {contact.isUnread ? 'unread message' : ''}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Spinner />
      )}
    </Box>
  )
}

const ChatContainer = ({
  userId,
  serviceId,
  locale,
  user
}: {
  userId?: number
  serviceId?: number
  locale: SupportedLocale
  user: UserWithServicesWithPrices
}) => {
  const [conversationWithUserId, setConversationWithUserId] = useState(userId)
  return (
    <Container maxWidth="xl">
      <Box
        display={'flex'}
        flexDirection={'row'}
        gap={2}
        sx={{
          pt: 20,
          pb: 10
        }}
      >
        <Contacts userId={conversationWithUserId} onContactClick={setConversationWithUserId} />
        {conversationWithUserId && (
          <Conversation
            locale={locale}
            conversationWithUserId={conversationWithUserId}
            iAmAFreelance={user.services.length > 0}
            serviceId={serviceId}
          />
        )}
      </Box>
    </Container>
  )
}

export default function Chat({ locale }: { locale: SupportedLocale }) {
  const router = useRouter()
  const { user } = useAuthSession()

  if (!user) {
    return <p>Not connected</p>
  }

  const parsedQuery = qsValidator.safeParse(router.query)

  if (parsedQuery.error) {
    return notFound()
  }

  const conversationWithUserId = parsedQuery.data.userId

  return (
    <ChatContainer
      userId={conversationWithUserId}
      serviceId={parsedQuery.data.serviceId}
      locale={locale}
      user={user}
    />
  )
}
