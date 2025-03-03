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
import { GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { FormEvent, ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { SuportedLocale } from '@/config'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { Spinner } from '@/components/Spinner'
import { cleanHtmlTag } from '@/utils/cleanHtmlTag'

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
  const { user, error } = useAuthSession()
  const { t } = useTranslation('common')
  const [showFreelanceConfiguration, setShowFreelanceConfiguration] = useState(false)
  const [jobTitle, setJobTitle] = useState(user?.jobTitle)
  const [description, setDescription] = useState(user?.description)
  const [openSnackBar, setOpenSnackBar] = useState(false)

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

  const handleSubmitJobTitle = (e: FormEvent) => {
    e.preventDefault()

    setOpenSnackBar(true)
  }

  const handleSubmitDescription = (e: FormEvent) => {
    e.preventDefault()

    console.log(description)

    setOpenSnackBar(true)
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
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t('saved')}
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
                <Typography variant="body1">{user.isFreelance ? t('yes') : t('no')}</Typography>
              </Grid>
              <Grid size={6} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                <Typography variant="h4" component={'p'}>
                  {t('jobTitle')}
                </Typography>
              </Grid>
              <Grid size={6}>
                <form onSubmit={handleSubmitJobTitle}>
                  <Box display={'flex'} flexDirection={'row'} gap={4}>
                    <TextField
                      onChange={e => setJobTitle(e.target.value)}
                      variant="outlined"
                      fullWidth
                      value={jobTitle}
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      sx={{
                        height: 54,
                        minWidth: 120
                      }}
                    >
                      {t('save')}
                    </Button>
                  </Box>
                </form>
              </Grid>
              {!user.isFreelance && (
                <Grid size={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                  <Button
                    onClick={() => setShowFreelanceConfiguration(true)}
                    variant="contained"
                    color="primary"
                  >
                    {t('activateFreelance')}
                  </Button>
                </Grid>
              )}
              {showFreelanceConfiguration && (
                <>
                  <Grid size={2}>
                    <Typography variant="h4" component={'p'}>
                      {t('description')}
                    </Typography>
                  </Grid>
                  <Grid size={10}>
                    <form onSubmit={handleSubmitDescription}>
                      <Box display={'flex'} flexDirection={'row'} gap={4}>
                        <Box width={'100%'} minHeight={100}>
                          <ReactQuill
                            modules={{
                              toolbar: [['bold', 'italic', 'underline'], [{ list: 'bullet' }]]
                            }}
                            theme="snow"
                            value={description}
                            onChange={v => setDescription(cleanHtmlTag(v))}
                          />
                          <Typography variant="body2">{t('descriptionHelpText')}</Typography>
                        </Box>
                        <Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          sx={{
                            height: 54,
                            minWidth: 120
                          }}
                        >
                          {t('save')}
                        </Button>
                      </Box>
                    </form>
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
                          dangerouslySetInnerHTML={{ __html: description }}
                          sx={{
                            backgroundColor: 'white',
                            p: 1
                          }}
                        ></Box>
                      </Box>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Base>
  )
}
