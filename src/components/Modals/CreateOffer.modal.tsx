import { useCrudService } from '@/hooks/services/crudService.hook'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { FormEvent, useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Spinner } from '../Spinner'
import { FormError } from '@/utils/effects/Errors'
import { useTranslation } from 'next-i18next'
import {
  CreateOffer,
  ErrorsTag,
  useCreateOfferFormValidation
} from '@/hooks/forms/createOffer.form.hook'
import { NumericFormat } from 'react-number-format'
import config from '@/config'
import { trpc } from '@/utils/trpc'

export default function CreateOfferModal({
  handleClose,
  receiverId
}: {
  handleClose: () => void
  receiverId: number
}) {
  const { t: commonT } = useTranslation('common')
  const { t } = useTranslation('service')
  const [formValues, setFormValues] = useState<CreateOffer>({
    serviceId: undefined,
    description: '',
    price: 0,
    deadline: undefined
  })
  const [showSpinner, setShowSpinner] = useState(false)

  const { mutateAsync: createOffer } = trpc.protectedMutation.offer.create.useMutation()
  const { mutateAsync: sendMessage } = trpc.protectedMutation.sendMessage.useMutation()

  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [formErrors, setFormErrors] = useState<FormError[]>([])
  const { userServices } = useCrudService()

  const { validate } = useCreateOfferFormValidation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const errors = validate(formValues)

    if (!formValues.serviceId) {
      errors.push(FormError.of(ErrorsTag.ServiceId)(new Error('serviceId must be setted')))
    }

    if (
      formValues.serviceId &&
      !userServices.map(service => service.id).includes(formValues.serviceId)
    ) {
      errors.push(FormError.of(ErrorsTag.ServiceId)(new Error('serviceId must be in your list')))
    }

    setFormErrors(errors)
    if (errors.length) {
      setOpenSnackBar(true)
      return
    }

    setShowSpinner(true)

    createOffer({
      deadline: formValues.deadline!,
      description: formValues.description,
      price: formValues.price * 100,
      serviceId: formValues.serviceId!,
      receiverId
    })
      .then(offer => {
        return sendMessage({
          offerId: offer.id,
          receiverId: receiverId,
          message: 'send offer'
        })
      })
      .then(() => {
        setOpenSnackBar(true)
        setTimeout(() => handleClose(), 1000)
      })
      .catch(err => {
        setFormErrors([err])
        console.error(err)
        setOpenSnackBar(true)
      })
      .finally(() => setShowSpinner(false))
  }

  const getErrorByTag = (tag: ErrorsTag): FormError | null => {
    return formErrors.find(error => error.tag === tag) ?? null
  }

  return showSpinner ? (
    <Spinner />
  ) : (
    <Box
      sx={{
        overflowY: 'scroll',
        minWidth: { xs: 340, md: 1000 },
        m: 1
      }}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={formErrors.length ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {formErrors[0] ? t(formErrors[0].message) : t('saved')}
        </Alert>
      </Snackbar>
      <Typography variant="h2" component={'p'}>
        Proposer une offre
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display={'flex'} flexDirection={'column'} gap={3} alignItems={'center'} margin={2}>
          <Box
            width={'100%'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-evenly'}
          >
            <FormControl
              sx={{
                width: '50%'
              }}
            >
              <InputLabel id="service">{commonT('services')}</InputLabel>
              <Select
                variant="standard"
                labelId="service"
                value={formValues.serviceId ?? 0}
                error={getErrorByTag(ErrorsTag.ServiceId) !== null}
                onChange={e =>
                  setFormValues(state => ({
                    ...state,
                    serviceId: parseInt(e.target.value.toString(), 10)
                  }))
                }
              >
                {userServices.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                width: '15%'
              }}
            >
              <NumericFormat
                value={formValues.price}
                onValueChange={e => {
                  setFormValues(s => ({
                    ...s,
                    price: e.floatValue ?? 0
                  }))
                }}
                customInput={TextField}
                thousandSeparator
                decimalScale={2}
                valueIsNumericString
                allowNegative={false}
                id="price"
                variant="standard"
                label="Price €"
                error={getErrorByTag(ErrorsTag.Price) !== null}
              />
            </FormControl>
            <FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  disablePast
                  label="deadline"
                  onChange={date =>
                    setFormValues(state => ({
                      ...state,
                      deadline: date ?? undefined
                    }))
                  }
                />
              </LocalizationProvider>
              {getErrorByTag(ErrorsTag.Deadline) !== null && (
                <Typography variant="body2" color="error">
                  Error
                </Typography>
              )}
            </FormControl>
          </Box>
          <TextField
            type="textarea"
            fullWidth
            variant="standard"
            color="primary"
            label={`${commonT('description')}`}
            error={getErrorByTag(ErrorsTag.Description) !== null}
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
          <Button size="medium" type="submit" variant="contained">
            {commonT('save')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
