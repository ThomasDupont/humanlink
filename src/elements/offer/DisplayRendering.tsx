import BaseModal from '@/components/BaseModal'
import DeleteAMilestoneFileModal from '@/components/Modals/DeleteAMilestoneFile.modal'
import { SupportedLocale } from '@/config'
import { Rendering } from '@/hooks/offer/rendering.hook'
import { useUserState } from '@/state/user.state'
import { ArrayElement } from '@/types/utility.type'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { ConcernedOffer, FilesFromAPI } from '@/utils/trpc'
import { MoreVert } from '@mui/icons-material'
import {
  Box,
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
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useState } from 'react'

const FileButtons = ({
  offer,
  file,
  milestoneId,
  handleChange
}: {
  offer: ConcernedOffer
  file: ArrayElement<FilesFromAPI>
  milestoneId: number
  handleChange: () => void
}) => {
  const { t } = useTranslation('common')

  const [openDeleteAMilestoneFileModal, setOpenDeleteAMilestoneFileModal] = useState(false)

  const { userSnapshot } = useUserState()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const isTheAuthorOfTheOffer = userSnapshot.userId === offer.userId

  return (
    <Box>
      <BaseModal
        open={openDeleteAMilestoneFileModal}
        handleClose={() => setOpenDeleteAMilestoneFileModal(false)}
      >
        <DeleteAMilestoneFileModal
          offerId={offer.id}
          file={file}
          milestoneId={milestoneId}
          handleClose={decision => {
            setOpenDeleteAMilestoneFileModal(false)

            if (decision === 'yes') {
              handleChange()
            }
          }}
        />
      </BaseModal>
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
        <Link href={file.signedUrl} target="_blank">
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
            }}
          >
            {t('download')}
          </MenuItem>
        </Link>
        {isTheAuthorOfTheOffer && (
          <MenuItem
            onClick={() => {
              setOpenDeleteAMilestoneFileModal(true)
              setAnchorEl(null)
            }}
          >
            {t('delete')}
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export const DisplayRendering = ({
  offer,
  locale,
  renderings,
  handleChange
}: {
  offer: ConcernedOffer
  locale: SupportedLocale
  renderings: Rendering[]
  handleChange: () => void
}) => {
  if (renderings.length === 0) {
    return <></>
  }

  const getARendering = (milestoneId: number) => renderings.find(r => r.milestoneId === milestoneId)

  const parseDate = (date: string) =>
    format(new Date(date), 'PPP', { locale: localeToDateFnsLocale(locale) })

  return (
    <Box
      sx={t => ({
        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
        boxShadow: t.shadows[1],
        backgroundColor: t.palette.background.paper,
        mt: 2,
        p: 2
      })}
    >
      {offer.milestone.map(milestone => {
        const rendering = getARendering(milestone.id)
        return (
          <Box key={milestone.id}>
            <Box
              display={'flex'}
              flexDirection={'row'}
              gap={2}
              justifyContent={'flex-start'}
              alignItems={'center'}
              sx={{
                mb: 2
              }}
            >
              <Typography variant={'h3'} component={'h2'}>
                Offer rendering
              </Typography>
              <Typography variant="body2">deadline {parseDate(milestone.deadline)}</Typography>
            </Box>
            <Typography variant="body1">{milestone.description}</Typography>
            {milestone.renderingText && (
              <Box
                sx={{
                  mt: 2,
                  mb: 2
                }}
              >
                <Typography gutterBottom variant="body1">
                  Text rendering :
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    border: '1px solid',
                    p: 2
                  }}
                >
                  {milestone.renderingText}
                </Typography>
              </Box>
            )}
            {rendering && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Filename</TableCell>
                    <TableCell>size</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rendering.files.map(file => {
                    return (
                      <TableRow key={file.id}>
                        <TableCell>{file.originalFilename}</TableCell>
                        <TableCell>{file.size / 1_000_000}</TableCell>
                        <TableCell>
                          <FileButtons
                            offer={offer}
                            file={file}
                            milestoneId={rendering.milestoneId}
                            handleChange={handleChange}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
