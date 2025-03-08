import BaseModal from '@/components/BaseModal'
import CreateOrUpdateServiceModal from '@/components/Modals/CreateOrUpdateServiceModal'
import DeleteAService from '@/components/Modals/DeleteAService'
import { ServiceWithPrice } from '@/types/Services.type'
import { trpc } from '@/utils/trpc'
import { MoreVert } from '@mui/icons-material'
import {
  Box,
  Button,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ServiceButton = ({
  setOpenAddServiceModal,
  setOpenRemoveServiceModal
}: {
  setOpenAddServiceModal: () => void
  setOpenRemoveServiceModal: () => void
}) => {
  const { t } = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <Box>
      <IconButton
        id="demo-positioned-button"
        aria-controls={open ? 'positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="positioned-menu"
        aria-labelledby="positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setOpenAddServiceModal()
          }}
        >
          {t('edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setOpenRemoveServiceModal()
          }}
        >
          {t('delete')}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default function ServicesItem() {
  const { t } = useTranslation('dashboard')
  const [openAddServiceModal, setOpenAddServiceModal] = useState(false)
  const [openRemoveServiceModal, setOpenRemoveServiceModal] = useState(false)
  const [currentService, setCurrentService] = useState<Omit<ServiceWithPrice, 'createdAt'>>()
  const { data: services, refetch } = trpc.protectedGet.userServices.useQuery()

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
      <Box
        id="services-list"
        sx={{
          mt: 2
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services?.map(service => (
              <TableRow key={service.id}>
                <TableCell>{service.title}</TableCell>
                <TableCell>
                  <CardMedia
                    component={'img'}
                    image={service.images[0]}
                    sx={{
                      height: '62px',
                      width: '100px'
                    }}
                  />
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>
                  {service.prices[0]?.number && service.prices[0].number / 100}{' '}
                  {service.prices[0]?.currency}
                </TableCell>
                <TableCell>
                  <ServiceButton
                    setOpenAddServiceModal={() => {
                      setCurrentService(service)
                      setOpenAddServiceModal(true)
                    }}
                    setOpenRemoveServiceModal={() => {
                      setCurrentService(service)
                      setOpenRemoveServiceModal(true)
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <BaseModal open={openAddServiceModal} handleClose={() => setOpenAddServiceModal(false)}>
        <CreateOrUpdateServiceModal
          service={currentService}
          handleClose={() => {
            refetch()
            setOpenAddServiceModal(false)
          }}
        />
      </BaseModal>
      {currentService && (
        <BaseModal
          open={openRemoveServiceModal}
          handleClose={() => setOpenRemoveServiceModal(false)}
        >
          <DeleteAService
            id={currentService.id}
            handleClose={() => {
              refetch()
              setOpenRemoveServiceModal(false)
            }}
          />
        </BaseModal>
      )}
    </Box>
  )
}
