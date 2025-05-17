import { Spinner } from '@/components/Spinner'
import config from '@/config'
import { Rendering } from '@/hooks/offer/rendering.hook'
import InputFileUpload from '@/materials/InputFileUpload'
import { ConcernedOffer, trpc } from '@/utils/trpc'
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  TextField,
  Chip,
  FormControlLabel,
  Switch,
  Button
} from '@mui/material'
import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

export const AddARenderingModal = ({
  offer,
  handleClose,
  renderings
}: {
  offer: ConcernedOffer
  handleClose: () => void
  renderings: Rendering[]
}) => {
  const { t: commonT } = useTranslation('common')
  const { mutateAsync } = trpc.protectedMutation.milestone.addRendering.useMutation()
  const { mutateAsync: closeMilestoneMutateAsync } =
    trpc.protectedMutation.milestone.closeMilestone.useMutation()

  const [formValues, setFormValues] = useState<{
    description: string
    files: File[]
    closeOffer: boolean
  }>({
    description: '',
    files: [],
    closeOffer: false
  })

  const [showSpinner, setShowSpinner] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [error, setError] = useState<string>()

  const milestoneId = offer.milestone[0]?.id

  if (!milestoneId) {
    return (
      <Typography variant="body1" color="error">
        No milestone on offer
      </Typography>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const formData = new FormData()

    formData.append('offerId', offer.id.toString())
    for (const file of formValues.files) {
      formData.append('files', file)
    }

    setShowSpinner(true)

    const upload = async (): Promise<{
      files: {
        originalFilename: string
        hash: string
      }[]
    }> => {
      if (formValues.files.length) {
        return fetch('/api/upload/offer', {
          method: 'POST',
          body: formData
        }).then(response => response.json())
      }

      return { files: [] }
    }

    try {
      const { files } = await upload()

      await mutateAsync({
        offerId: offer.id,
        milestoneId,
        files: files.map(file => ({
          path: file.hash,
          originalFilename: file.originalFilename
        })),
        text: formValues.description
      })
      if (formValues.closeOffer) {
        await closeMilestoneMutateAsync({
          offerId: offer.id,
          milestoneId
        })
      }
      setTimeout(() => handleClose(), 1000)
    } catch (error) {
      console.warn('Error:', error)
      setError((error as Error).message)
    } finally {
      setShowSpinner(false)
      setOpenSnackBar(true)
    }
  }

  const handleDeleteFromFileList = (name: string) => {
    const fileIndex = formValues.files.findIndex(f => f.name === name)
    const newFilesList = formValues.files.filter((_, i) => i !== fileIndex)

    setFormValues(state => ({
      ...state,
      files: newFilesList
    }))
  }

  const totalFileSizeAlreadySent = renderings.reduce(
    (acc, rendering) => acc + rendering.files.reduce((acc, file) => acc + file.size, 0),
    0
  )
  const totalFileSize =
    formValues.files.reduce((acc, file) => acc + file.size, 0) + totalFileSizeAlreadySent

  const totalFile =
    formValues.files.length + renderings.map(rendering => rendering.files).flat().length

  return (
    <Box
      sx={t => ({
        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
        boxShadow: t.shadows[1],
        backgroundColor: 'inherit',
        mt: 2,
        p: 2
      })}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={error ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error ? commonT(error) : commonT('saved')}
        </Alert>
      </Snackbar>
      {showSpinner ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            type="textarea"
            fullWidth
            variant="standard"
            color="primary"
            label={`add a text (with external link)`}
            // error={getErrorByTag(Tag.Description) !== null}
            multiline
            minRows={6}
            onChange={e =>
              setFormValues(state => ({
                ...state,
                description: e.target.value
              }))
            }
            value={formValues.description}
            helperText={`${formValues.description.length} / ${config.userInteraction.descriptionMaxLen}`}
            slotProps={{
              input: {
                spellCheck: 'false'
              },
              htmlInput: { maxLength: config.userInteraction.descriptionMaxLen }
            }}
          />
          <Box
            display={'flex'}
            flexDirection={'row'}
            gap={1}
            justifyContent={'space-around'}
            flexWrap={'wrap'}
            sx={{ mb: 2 }}
          >
            {formValues.files.map(file => (
              <Chip
                key={file.name}
                label={file.name}
                onDelete={() => handleDeleteFromFileList(file.name)}
              />
            ))}
          </Box>
          <Box
            display={'flex'}
            flexDirection={'row'}
            gap={1}
            justifyContent={'space-around'}
            sx={{
              mb: 2
            }}
          >
            {formValues.files.length < 5 && (
              <InputFileUpload
                disabled={
                  totalFileSize > config.userInteraction.maxUploadFileSize ||
                  totalFile > config.userInteraction.maxUploadFiles
                }
                onChange={files => {
                  if (files === null) return
                  setFormValues(state => ({
                    ...state,
                    files: [...[...files], ...state.files]
                  }))
                }}
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  onChange={v =>
                    setFormValues(state => ({
                      ...state,
                      closeOffer: v.target.checked
                    }))
                  }
                />
              }
              label="Close offer"
            />
            <Button
              disabled={totalFileSize > config.userInteraction.maxUploadFileSize}
              size="medium"
              type="submit"
              variant="contained"
            >
              {commonT('save')}
            </Button>
          </Box>
          {totalFileSize > config.userInteraction.maxUploadFileSize && (
            <Typography variant="body2" color="error">
              {`The total size of the files is too big (${totalFileSize / 1_000_000} Mb)`}
            </Typography>
          )}
          {totalFile > config.userInteraction.maxUploadFiles && (
            <Typography variant="body2" color="error">
              {`The total file is over than ${config.userInteraction.maxUploadFiles}`}
            </Typography>
          )}
          <Typography variant="body2">{`The number of uploaded file is limited to ${config.userInteraction.maxUploadFiles} and limited to ${config.userInteraction.maxUploadFileSize / 1_000_000} Mb in total. If you want to share bigger file, you can add la link in the text field (like a WeTransfer link).`}</Typography>
        </form>
      )}
    </Box>
  )
}
