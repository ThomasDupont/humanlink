import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

export default function InputFileUpload({
  onChange,
  disabled,
  accept
}: {
  onChange: (files: FileList | null) => void
  disabled?: boolean
  accept?: string[]
}) {
  return (
    <Button
      component="label"
      role={undefined}
      variant="outlined"
      tabIndex={-1}
      disabled={disabled}
      startIcon={<CloudUploadIcon />}
    >
      Upload files
      <VisuallyHiddenInput
        multiple
        type="file"
        accept={accept?.join(',')}
        onChange={event => onChange(event.target.files)}
      />
    </Button>
  )
}
