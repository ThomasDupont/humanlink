import { ConcernedOffer, trpc } from '@/utils/trpc'
import { Box, Typography, Button, Alert, Snackbar, TextField } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { FormEvent, useState } from 'react'
import { Spinner } from '../Spinner'
import { t } from 'i18next'
import config from '@/config'

export default function DeclareADisputeModal({
  offer,
  handleClose
}: {
  offer: ConcernedOffer
  handleClose: () => void
}) {
  const { t: commonT } = useTranslation('common')

  const [validateError, setValidateError] = useState<string>()
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [formValues, setFormValues] = useState<{ description: string }>({
    description: ''
  })

  const { mutateAsync } = trpc.protectedMutation.offer.declareADisputeOnOffer.useMutation()

  const handleSubmitDeclareADispute = (e: FormEvent) => {
    e.preventDefault()

    if (formValues.description.length < 1) {
      setValidateError('description_too_short')
      return
    }

    setShowSpinner(true)
    mutateAsync({
      offerId: offer.id,
      comment: formValues.description
    })
      .then(() => {
        setTimeout(() => handleClose(), 1000)
      })
      .catch(error => {
        setValidateError(error.message)
      })
      .finally(() => {
        setOpenSnackBar(true)
        setShowSpinner(false)
      })
  }

  return showSpinner ? (
    <Spinner />
  ) : (
    <Box
      minHeight={300}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-around'}
      gap={2}
      sx={{
        m: 2
      }}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={validateError ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {validateError ? t(validateError) : t('saved')}
        </Alert>
      </Snackbar>
      <Typography variant="h4" component="p">
        {commonT('declareDisputeOnAffer')}
      </Typography>
      <Typography variant="body1">
        Please put any detail to explain what kind of issue you have with this offer. Do not
        hesitate to add any details relevant.
      </Typography>
      <form onSubmit={handleSubmitDeclareADispute}>
        <TextField
          type="textarea"
          fullWidth
          variant="standard"
          color="primary"
          label={`${commonT('description')}`}
          error={validateError != null}
          multiline
          minRows={3}
          onChange={e =>
            setFormValues(state => ({
              ...state,
              description: e.target.value
            }))
          }
          value={formValues.description}
          helperText={`${formValues.description.length} / ${config.userInteraction.serviceDescriptionMaxLen}`}
          slotProps={{
            input: {
              spellCheck: 'false'
            },
            htmlInput: { maxLength: config.userInteraction.serviceDescriptionMaxLen }
          }}
        />
        <Button type="submit" variant="outlined" color="error">
          {commonT('save')}
        </Button>
      </form>
    </Box>
  )
}
