import BaseModal from '@/components/BaseModal'
import CreateServiceModal from '@/components/Modals/CreateService.modal'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ServicesItem() {
  const { t } = useTranslation('dashboard')
  const [openAddServiceModal, setOpenAddServiceModal] = useState(false)
  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography textAlign={'center'} variant="h3" component={'h2'}>
        {t('servicesManagement')}
      </Typography>
      <Box display={'flex'} justifyContent={'flex-end'}>
        <Button onClick={() => setOpenAddServiceModal(true)} variant="contained" color="primary">
          {t('addService')}
        </Button>
      </Box>
      <BaseModal open={openAddServiceModal} handleClose={() => setOpenAddServiceModal(false)}>
        <CreateServiceModal />
      </BaseModal>
    </Box>
  )
}
