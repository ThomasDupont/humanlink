import {
  Avatar,
  Box,
  Button,
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
import { FormEvent, useState, KeyboardEvent, useEffect } from 'react'
import { useConversation } from '@/hooks/chat/conversation.hook'
import { Spinner } from '@/components/Spinner'
import config, { SuportedLocale } from '@/config'
import BaseModal from '@/components/BaseModal'
import CreateOfferModal from '@/components/Modals/CreateOffer.modal'
import { useTranslation } from 'react-i18next'
import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import ShowOffer from '@/elements/ShowOffer.element'

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
  locale
}: {
  conversationWithUserId: number
  locale: SuportedLocale
  serviceId?: number
}) => {
  const { t } = useTranslation('chat')
  const { data: user, isFetching } = trpc.get.userById.useQuery(conversationWithUserId)
  const [message, setMessage] = useState<string>()
  const [openCreateOfferModal, setOpenCreateOfferModal] = useState(false)
  const [newOffer, setNewOffer] = useState<OfferWithMileStonesAndMilestonePrice>()

  useEffect(() => {
    if (newOffer) {
      mutateAsync({
        receiverId: conversationWithUserId,
        message: '',
        offerId: newOffer.id
      }).then(() => {
        refetch()
        setMessage('')
      })
    }
  }, [newOffer])

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

  if (isFetching) {
    return <Spinner />
  }

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
        <Box
          id="main"
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'flex-end'}
          sx={{
            height: '100%',
            m: 2
          }}
        >
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
                  />
                ) : (
                  <Typography
                    variant="body1"
                    sx={t => ({
                      borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
                      boxShadow: t.shadows[1],
                      textAlign: 'center',
                      backgroundColor:
                        message.receiverId === conversationWithUserId
                          ? t.palette.primary[100]
                          : 'white',
                      padding: 1
                    })}
                  >
                    {message.message}{' '}
                  </Typography>
                )}
              </Box>
            )
          })}
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
            {user.services.length > 0 && (
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
            setNewOffer={offer => {
              setNewOffer(offer)
              setOpenCreateOfferModal(false)
            }}
          />
        </BaseModal>
      </Box>
    )
  )
}

const Contacts = () => {
  return <></>
}

export default function Chat({ locale }: { locale: SuportedLocale }) {
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
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20,
          pb: 10
        }}
      >
        <Contacts />
        {conversationWithUserId && (
          <Conversation
            locale={locale}
            conversationWithUserId={conversationWithUserId}
            serviceId={parsedQuery.data.serviceId}
          />
        )}
      </Box>
    </Container>
  )
}
