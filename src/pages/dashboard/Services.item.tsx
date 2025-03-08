import BaseModal from '@/components/BaseModal'
import CreateOrUpdateServiceModal from '@/components/Modals/CreateOrUpdateServiceModal'
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
        <CreateOrUpdateServiceModal />
      </BaseModal>
    </Box>
  )
}
