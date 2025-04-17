import config from '@/config'
import {
  CreateServiceFormSchema,
  Tag,
  useCreateServiceFormValidation
} from '@/hooks/forms/createService.form.hook'
import { FormError } from '@/utils/effects/Errors'
import InputFileUpload from '@/materials/InputFileUpload'
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
  Typography,
  Chip
} from '@mui/material'
import { NumericFormat } from 'react-number-format'
import { Category, Lang } from '@prisma/client'
import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
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
    Omit<CreateServiceFormSchema, 'category' | 'price'> & {
      category?: Category
      price?: number
      files: File[]
    }
  >({
    title: service ? service.title : '',
    shortDescription: service ? service.descriptionShort : '',
    description: service ? service.description : '',
    category: service ? service.category : undefined,
    langs: service ? service.langs : [],
    price: service && service.prices ? (service.prices[0]?.number ?? 1) / 100 : undefined,
    files: []
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const errors = validate(formValues)

    setFormErrors(errors)
    if (errors.length) {
      setOpenSnackBar(true)
      return
    }

    const { price, langs, category, ...raws } = formValues

    setShowSpinner(true)

    const upload = async (
      serviceId: number
    ): Promise<{
      files: {
        originalFilename: string
        hash: string
      }[]
    }> => {
      const formData = new FormData()

      formData.append('serviceId', serviceId.toString())
      for (const file of formValues.files) {
        formData.append('files', file)
      }

      if (formValues.files.length) {
        return fetch('/api/upload/service', {
          method: 'POST',
          body: formData
        }).then(response => response.json())
      }

      return { files: [] }
    }

    try {
      const basePayload = {
        ...raws,
        category: category!,
        langs: [...langs],
        prices: [
          {
            number: price! * 100,
            id: service?.prices[0]?.id
          }
        ]
      }

      if (service?.id) {
        // update
        const files = await upload(service.id)
        await upsertService({
          ...basePayload,
          id: service.id,
          files: files.files.map(f => f.hash)
        })
      } else {
        // create
        const result = await upsertService({
          ...basePayload,
          files: [] // create after
        })
        const files = await upload(result.id)

        await upsertService({
          ...basePayload,
          id: result.id,
          files: files.files.map(f => f.hash)
        })
      }

      setOpenSnackBar(true)
      setTimeout(() => handleClose(), 1000)
    } catch (error) {
      const err = error as Error
      setFormErrors([new FormError(Tag.Server, err.message)])
      console.error(error)
      setOpenSnackBar(true)
    } finally {
      setShowSpinner(false)
    }
  }

  const handleDeleteFromFileList = (name: string) => {
    const fileIndex = formValues.files.findIndex(f => f.name === name)
    const newFilesList = formValues.files.filter((_, i) => i !== fileIndex)

    setFormValues(state => ({
      ...state,
      files: newFilesList
    }))
  }

  const getErrorByTag = (tag: Tag): FormError | null => {
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
                error={getErrorByTag(Tag.Category) !== null}
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
              <InputFileUpload
                accept={config.userInteraction.extFilesForService}
                onChange={files => {
                  if (files === null) return
                  setFormValues(state => ({
                    ...state,
                    files: [...[...files], ...state.files]
                  }))
                }}
              />
            </FormControl>
            <Box
              display={'flex'}
              flexDirection={'row'}
              gap={1}
              justifyContent={'space-around'}
              flexWrap={'wrap'}
              sx={{ mb: 2 }}
            >
              {formValues.files.map(file => (
                <Chip
                  key={file.name}
                  label={file.name}
                  onDelete={() => handleDeleteFromFileList(file.name)}
                />
              ))}
            </Box>
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
                error={getErrorByTag(Tag.Langs) !== null}
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
                error={getErrorByTag(Tag.Price) !== null}
              />
            </FormControl>
          </Box>
          <TextField
            type="text"
            fullWidth
            variant="standard"
            color="primary"
            label={`${commonT('title')}`}
            error={getErrorByTag(Tag.Title) !== null}
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
            error={getErrorByTag(Tag.ShortDescription) !== null}
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
              {getErrorByTag(Tag.Description) && (
                <Typography color="error" variant="body1">
                  {getErrorByTag(Tag.Description)?.message}
                </Typography>
              )}
            </Box>
          </Box>
          <Button disabled={openSnackBar} size="medium" type="submit" variant="contained">
            {commonT('save')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
