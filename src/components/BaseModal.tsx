import { Close } from '@mui/icons-material'
import { Box, Divider, Fade, IconButton, Modal } from '@mui/material'

type BaseModalProps = {
  children: React.ReactElement
  open: boolean
  handleClose: () => void
}
export default function BaseModal({ children, open, handleClose }: BaseModalProps) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Fade in={open}>
        <Box
          sx={t => ({
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '200px',
            minHeight: '300px',
            transform: 'translate(-50%, -50%)',
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            textAlign: 'center',
            backgroundColor: 'white',
            color: 'secondary',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignContent: 'center',
            alignItems: 'center'
          })}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              m: '4px'
            }}
          >
            <IconButton onClick={() => handleClose()} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Divider
            sx={{
              width: '100%',
              mb: 2
            }}
          />
          {children}
        </Box>
      </Fade>
    </Modal>
  )
}
