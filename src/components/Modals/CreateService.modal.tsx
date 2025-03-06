import config from '@/config'
import {
  CreateServiceFormSchema,
  ErrorsTag,
  useCreateServiceFormValidation
} from '@/hooks/forms/createService.form.hook'
import { FormError } from '@/hooks/forms/Errors'
import { categoryToArray, langsToArray } from '@/utils/retreatPrismaSchema'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { Category, Lang } from '@prisma/client'
import { FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

export default function CreateServiceModal() {
  const [formValues, setFormValues] = useState<
    Omit<CreateServiceFormSchema, 'category'> & { category?: Category }
  >({
    title: '',
    shortDescription: '',
    description: '',
    category: undefined,
    langs: [],
    price: 0
  })
  const { t } = useTranslation('dashboard')
  const { t: commonT } = useTranslation('common')
  const { t: serviceT } = useTranslation('service')

  const [formErrors, setFormErrors] = useState<FormError[]>([])
  const [openSnackBar, setOpenSnackBar] = useState(false)

  const { validate } = useCreateServiceFormValidation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const errors = validate(formValues)

    setFormErrors(errors)
    if (errors.length) {
      setOpenSnackBar(true)
    }
  }

  const getErrorByTag = (tag: ErrorsTag): FormError | null => {
    return formErrors.find(error => error.tag === tag) ?? null
  }

  return (
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
        {t('addService')}
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
                value={formValues.category}
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
              <InputLabel htmlFor="price">Price €</InputLabel>
              <Input
                value={formValues.price}
                onChange={e => {
                  const n = parseInt(e.target.value, 10)
                  setFormValues(s => ({
                    ...s,
                    price: isNaN(n) ? 0 : n
                  }))
                }}
                error={getErrorByTag(ErrorsTag.Price) !== null}
                id="price"
                aria-label="price"
                type="number"
                color="primary"
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
          <TextField
            type="textarea"
            fullWidth
            variant="standard"
            color="primary"
            minRows={4}
            label={`${commonT('description')}`}
            error={getErrorByTag(ErrorsTag.Description) !== null}
            multiline
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
              htmlInput: { maxLength: config.userInteraction.descriptionMaxLen }
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
