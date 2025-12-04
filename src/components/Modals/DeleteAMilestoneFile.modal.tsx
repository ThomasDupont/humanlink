import { Alert, Box, Button, Snackbar, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Spinner } from '../Spinner'
import { FilesFromAPI, trpc } from '@/utils/trpc'
import { ArrayElement } from '@/types/utility.type'

export default function DeleteAMilestoneFileModal({
  file,
  milestoneId,
  offerId,
  handleClose
}: {
  file: ArrayElement<FilesFromAPI>
  offerId: number
  milestoneId: number
  handleClose: (type: 'yes' | 'no') => void
}) {
  const { t } = useTranslation('dashboard')
  const { t: commonT } = useTranslation('common')

  const [showSpinner, setShowSpinner] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [deleteError, setDeleteError] = useState<string>('')

  const { mutateAsync: deleteAMilestoneFile } =
    trpc.protectedMutation.milestone.deleteAMilestoneFile.useMutation()
  return showSpinner ? (
    <Spinner />
  ) : (
    <Box
      sx={{
        m: 1
      }}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={deleteError.length ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {deleteError.length ? t(deleteError) : commonT('saved')}
        </Alert>
      </Snackbar>
      <Typography gutterBottom variant="h4" component="p">
        {t('removeFile')}
      </Typography>
      <Typography gutterBottom variant="body1" component="p">
        {file.originalFilename}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'column'}
        gap={2}
        sx={{
          mt: 2
        }}
      >
        <Button
          onClick={() => {
            setShowSpinner(true)
            deleteAMilestoneFile({
              hash: file.hash,
              offerId,
              milestoneId
            })
              .then(() => {
                setOpenSnackBar(true)
                setTimeout(() => handleClose('yes'), 1000)
              })
              .catch(err => {
                setDeleteError(err.message)
                setOpenSnackBar(true)
                console.error(err)
              })
              .finally(() => setShowSpinner(false))
          }}
          variant="contained"
          color="primary"
        >
          {commonT('yes')}
        </Button>
        <Button
          disabled={openSnackBar}
          onClick={() => handleClose('no')}
          variant="contained"
          color="primary"
        >
          {commonT('no')}
        </Button>
      </Box>
    </Box>
  )
}
