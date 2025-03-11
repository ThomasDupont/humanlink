import config from '@/config'
import {
  CreateServiceFormSchema,
  ErrorsTag,
  useCreateServiceFormValidation
} from '@/hooks/forms/createService.form.hook'
import { FormError } from '@/utils/effects/Errors'
import { categoryToArray, langsToArray } from '@/utils/retreatPrismaSchema'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { NumericFormat } from 'react-number-format'
import { Category, Lang } from '@prisma/client'
import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import { cleanHtmlTag } from '@/utils/cleanHtmlTag'
import 'react-quill/dist/quill.snow.css'
import dynamic from 'next/dynamic'
import { ServiceWithPrice } from '@/types/Services.type'
import { Spinner } from '../Spinner'
import { useCrudService } from '@/hooks/services/crudService.hook'

const categories = categoryToArray(Category)
const langs = langsToArray(Lang)

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

export default function CreateOrUpdateServiceModal({
  service,
  handleClose
}: {
  service?: Omit<ServiceWithPrice, 'createdAt'>
  handleClose: () => void
}) {
  const [formValues, setFormValues] = useState<
    Omit<CreateServiceFormSchema, 'category' | 'price'> & { category?: Category; price?: number }
  >({
    title: service ? service.title : '',
    shortDescription: service ? service.descriptionShort : '',
    description: service ? service.description : '',
    category: service ? service.category : undefined,
    langs: service ? service.langs : [],
    price: service && service.prices ? (service.prices[0]?.number ?? 1) / 100 : undefined
  })
  const [showSpinner, setShowSpinner] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)

  const { t } = useTranslation('dashboard')
  const { t: commonT } = useTranslation('common')
  const { t: serviceT } = useTranslation('service')

  const { upsertService } = useCrudService()

  const [formErrors, setFormErrors] = useState<FormError[]>([])

  const { validate } = useCreateServiceFormValidation()

  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const errors = validate(formValues)

    setFormErrors(errors)
    if (errors.length) {
      setOpenSnackBar(true)
      return
    }

    const { price, langs, category, ...raws } = formValues

    setShowSpinner(true)
    upsertService({
      ...raws,
      category: category!,
      langs: [...langs],
      id: service?.id,
      prices: [
        {
          number: price! * 100,
          id: service?.prices[0]?.id
        }
      ]
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
      <Typography gutterBottom variant="h2" component={'p'}>
        {service ? commonT('edit') : t('addService')}
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
                width: '20%'
              }}
            >
              <InputLabel id="category">{commonT('category')}</InputLabel>
              <Select
                variant="standard"
                labelId="category"
                value={formValues.category ?? ''}
                error={getErrorByTag(ErrorsTag.Category) !== null}
                onChange={e =>
                  setFormValues(state => ({
                    ...state,
                    category: e.target.value as Category
                  }))
                }
              >
                {categories.map(categorie => (
                  <MenuItem key={categorie} value={categorie}>
                    {categorie}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                width: '20%'
              }}
            >
              <InputLabel id="lang">{serviceT('langs')}</InputLabel>
              <Select
                labelId="lang"
                multiple
                value={formValues.langs}
                renderValue={selected => selected.join(', ')}
                error={getErrorByTag(ErrorsTag.Langs) !== null}
                MenuProps={MenuProps}
                input={<OutlinedInput label="Tag" />}
                onChange={e => {
                  const langs = e.target.value as Lang[]
                  setFormValues(state => ({
                    ...state,
                    langs
                  }))
                }}
              >
                {langs.map(lang => (
                  <MenuItem key={lang} value={lang}>
                    <Checkbox checked={formValues.langs.includes(lang)} />
                    <ListItemText primary={lang} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                width: '20%'
              }}
            >
              <NumericFormat
                value={formValues.price ?? ''}
                onValueChange={e => {
                  setFormValues(s => ({
                    ...s,
                    price: e.floatValue
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
          </Box>
          <TextField
            type="text"
            fullWidth
            variant="standard"
            color="primary"
            label={`${commonT('title')}`}
            error={getErrorByTag(ErrorsTag.Title) !== null}
            onChange={e =>
              setFormValues(state => ({
                ...state,
                title: e.target.value
              }))
            }
            value={formValues.title}
            helperText={`${formValues.title.length} / ${config.userInteraction.serviceTitleMaxLen}  | "${serviceT('titleExample')}"`}
            slotProps={{
              input: {
                spellCheck: 'false'
              },
              htmlInput: { maxLength: config.userInteraction.serviceTitleMaxLen }
            }}
          />
          <TextField
            type="textarea"
            fullWidth
            variant="standard"
            color="primary"
            label={`${commonT('shortDescription')}`}
            error={getErrorByTag(ErrorsTag.ShortDescription) !== null}
            multiline
            onChange={e =>
              setFormValues(state => ({
                ...state,
                shortDescription: e.target.value
              }))
            }
            value={formValues.shortDescription}
            helperText={`${formValues.shortDescription.length} / ${config.userInteraction.serviceShortDescriptionMaxLen}`}
            slotProps={{
              input: {
                spellCheck: 'false'
              },
              htmlInput: { maxLength: config.userInteraction.serviceShortDescriptionMaxLen }
            }}
          />
          <Box
            width={'100%'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'flex-start'}
            textAlign={'left'}
          >
            <Box width={'100%'} minHeight={100}>
              <Typography variant="body2">{commonT('description')}</Typography>
              <ReactQuill
                modules={{
                  toolbar: [['bold', 'italic', 'underline'], [{ list: 'bullet' }]]
                }}
                theme="snow"
                value={formValues.description}
                onChange={v =>
                  setFormValues(state => ({
                    ...state,
                    description: cleanHtmlTag(DOMPurify)(v)
                  }))
                }
              />
              <Typography variant="body2">
                {`${formValues.description.length} / ${config.userInteraction.serviceDescriptionMaxLen}`}
              </Typography>
              {getErrorByTag(ErrorsTag.Description) && (
                <Typography color="error" variant="body1">
                  {getErrorByTag(ErrorsTag.Description)?.message}
                </Typography>
              )}
            </Box>
          </Box>
          <Button size="medium" type="submit" variant="contained">
            {commonT('save')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
