import { useAuthSession } from '@/hooks/nextAuth.hook'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Grid2 as Grid,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import DOMPurify from 'dompurify'
import { GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { FormEvent, ReactElement, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { format } from 'date-fns'
import config, { SuportedLocale } from '@/config'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { Spinner } from '@/components/Spinner'
import { cleanHtmlTag } from '@/utils/cleanHtmlTag'
import { trpc } from '@/utils/trpc'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20
        }}
      >
        {children}
      </Box>
    </Container>
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

export default function Profile({ locale }: { locale: SuportedLocale }) {
  const { user, error, refetch } = useAuthSession()

  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? '')
  const [description, setDescription] = useState(user?.description ?? '')

  const { t } = useTranslation('common')
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [formError, setFormError] = useState<string>()
  const { mutateAsync } = trpc.protectedMutation.user.profile.useMutation()

  useEffect(() => {
    if (user) {
      setJobTitle(user.jobTitle)
      setDescription(user.description)
    }
  }, [user?.email])

  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), [])

  if (!user && !error) {
    return (
      <Base>
        <Spinner />
      </Base>
    )
  }

  if (error) {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (description && description.length > config.userInteraction.descriptionMaxLen) {
      console.error('Desc too long')
      setFormError('descriptionTooLong')
      setOpenSnackBar(true)
      return
    }

    if (jobTitle && jobTitle.length > config.userInteraction.jobTitleMaxLen) {
      console.error('job title too long')
      setFormError('jobTitleTooLong')
      setOpenSnackBar(true)
      return
    }

    mutateAsync({
      description: description ?? '',
      jobTitle: jobTitle ?? ''
    }).then(() => {
      setOpenSnackBar(true)
      refetch()
    })
  }

  const parsedCreatedDate = format(user.createdAt, 'PPP', { locale: localeToDateFnsLocale(locale) })

  return (
    <Base>
      <Box
        sx={{
          mb: 10
        }}
      >
        <Snackbar
          open={openSnackBar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackBar(false)}
        >
          <Alert
            onClose={() => setOpenSnackBar(false)}
            severity={formError ? 'error' : 'success'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {formError ? t(formError) : t('saved')}
          </Alert>
        </Snackbar>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          gap={4}
          alignItems={'center'}
        >
          <Typography variant="h1">{t('profilePageTitle')}</Typography>
          <Box
            width={'100%'}
            maxWidth={'md'}
            display={'flex'}
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={4}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent={'space-between'}
          >
            <Avatar
              src={user.image ?? undefined}
              sx={{
                height: 100,
                width: 100
              }}
            />
            <form onSubmit={handleSubmit}>
              <Grid container rowSpacing={4}>
                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('firstname')} & {t('lastname')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">
                    {user.firstname} {user.lastname}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('email')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('oauthProvider')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">{user.oauthProvider}</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('creationDate')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">{parsedCreatedDate}</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('isFreelance')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">
                    {user.services.length ? t('yes') : t('no')}
                  </Typography>
                </Grid>

                <Grid size={6} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                  <Typography variant="h4" component={'p'}>
                    {t('jobTitle')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <TextField
                    onChange={e => setJobTitle(e.target.value)}
                    variant="outlined"
                    fullWidth
                    value={jobTitle}
                  />
                </Grid>

                <Grid size={2}>
                  <Typography variant="h4" component={'p'}>
                    {t('description')}
                  </Typography>
                </Grid>
                <Grid size={10}>
                  <Box width={'100%'} minHeight={100}>
                    <ReactQuill
                      modules={{
                        toolbar: [['bold', 'italic', 'underline'], [{ list: 'bullet' }]]
                      }}
                      theme="snow"
                      value={description}
                      onChange={v => setDescription(cleanHtmlTag(DOMPurify)(v))}
                    />
                    <Typography variant="body2">{t('descriptionHelpText')}</Typography>
                  </Box>

                  {description && (
                    <Box
                      sx={{
                        mt: 4
                      }}
                    >
                      <Typography
                        variant="h4"
                        component={'p'}
                        sx={{
                          mb: 2
                        }}
                      >
                        Preview description
                      </Typography>
                      <Box
                        id="preview-desc"
                        dangerouslySetInnerHTML={{
                          __html: description.slice(0, config.userInteraction.descriptionMaxLen)
                        }}
                        sx={{
                          backgroundColor: 'white',
                          p: 1
                        }}
                      ></Box>
                    </Box>
                  )}
                </Grid>

                <Grid size={6}>
                  <Typography variant="h4" component={'p'}>
                    {t('freelanceMode')}
                  </Typography>
                </Grid>
              </Grid>
              <Box
                width={'100%'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
                sx={{
                  mt: 4
                }}
              >
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  sx={{
                    height: 54,
                    width: 120
                  }}
                >
                  {t('save')}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Base>
  )
}
