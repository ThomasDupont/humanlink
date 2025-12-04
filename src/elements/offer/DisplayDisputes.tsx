import { SupportedLocale } from '@/config'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { DisplayDispute } from '@/utils/trpc'
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { format } from 'date-fns'

export const DisplayDisputes = ({
  locale,
  disputes
}: {
  locale: SupportedLocale
  disputes?: DisplayDispute[]
}) => {
  if (!disputes) return null

  const parsedCreatedDate = (date: string) =>
    format(new Date(date), 'PPP', {
      locale: localeToDateFnsLocale(locale)
    })

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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>status</TableCell>
            <TableCell>dispute text</TableCell>
            <TableCell>Decision</TableCell>
            <TableCell>Decision date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {disputes.map((dispute, i) => (
            <TableRow key={i}>
              <TableCell>{parsedCreatedDate(dispute.createdAt)}</TableCell>
              <TableCell>{dispute.decision}</TableCell>
              <TableCell>{dispute.text}</TableCell>
              <TableCell>{dispute.decisionComment ?? ''}</TableCell>
              <TableCell>
                {dispute.decisionAt ? parsedCreatedDate(dispute.decisionAt) : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
