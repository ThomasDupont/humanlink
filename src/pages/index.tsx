import {
  Box,
  Button,
  CardMedia,
  Container,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { FormEvent, useState, KeyboardEvent } from 'react'
import ForwardIcon from '@mui/icons-material/Forward'
import { Search } from '@mui/icons-material'
import { getSearchClientHook } from '../hooks/searchClients/hook.factory'
import ServiceCard from '../components/ServiceCard'
import { StyledGrid } from '@/materials/styledElement'
import { SwitchText } from '@/components/SwitchText'

const RESULT_NUMBER = 3
const useMatcherHook = getSearchClientHook('elastic')

export default function Home() {
  const [message, setMessage] = useState<string>()
  const [numberResult, setNumberResult] = useState<number>(RESULT_NUMBER)

  const { query, ready, result } = useMatcherHook()

  const resultToShow = result?.filter((_, i) => {
    return i < numberResult
  })

  const showMore = (resultToShow?.length ?? 0) < (result?.length ?? 0)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>
  ) => {
    event.preventDefault()

    if (message) query(message)
  }

  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={{ xs: 4, md: 12 }}
        sx={{
          pt: 20
        }}
      >
        <StyledGrid size={{ xs: 12, md: 6 }}>
          <Typography variant="body1" component="h1">
            Nous sélectionnons et certifions nos freelances pour garantir le meilleur à vos projets
          </Typography>
          <CardMedia
            component="img"
            sx={{ width: 150, height: 100 }}
            image="certified-people.svg"
            alt="Live from space album cover"
          />
        </StyledGrid>
        <StyledGrid size={{ xs: 12, md: 6 }}>
          <Typography variant="body1" component="p">
            Paiement uniquement après la livraison de votre commande
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: { xs: 0, md: 4 },
              alignItems: 'center'
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: 150, height: 80 }}
              image="satisfaction.svg"
              alt="Live from space album cover"
            />
            <ForwardIcon fontSize="large" />
            <CardMedia
              component="img"
              sx={{ width: 150, height: 80 }}
              image="paiement.svg"
              alt="Live from space album cover"
            />
          </Box>
        </StyledGrid>
      </Grid>

      <Box
        sx={{
          width: '100%',
          mt: 10
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            type="textarea"
            variant="outlined"
            color="primary"
            label="Décrivez votre besoin ou votre projet"
            onChange={e => setMessage(e.target.value)}
            value={message}
            fullWidth
            multiline
            minRows={1}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
            slotProps={{
              input: {
                spellCheck: 'false',
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      mr: 1
                    }}
                  >
                    <IconButton type="submit" edge="end">
                      <Search
                        fontSize="large"
                        sx={t => ({
                          color: t.palette.primary.dark
                        })}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              },
              htmlInput: { maxLength: 1000 }
            }}
            sx={() => ({
              backgroundColor: 'white'
            })}
          />
        </form>
        <SwitchText
          texts={[
            "J'ai un problème avec mon chat",
            'Je veux détourer des images',
            'Il me faut un site web'
          ]}
          prefix="Exemple :"
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          mt: 10
        }}
      >
        {ready !== null && (
          <pre className="bg-gray-100 p-2 rounded">{!ready ? 'Loading...' : ''}</pre>
        )}
      </Box>
      {resultToShow?.length ? (
        <Grid container spacing={2}>
          {resultToShow.map((r, i) => {
            return (
              <Grid
                key={i}
                size={{ xs: 12, md: resultToShow.length <= 3 ? 12 / resultToShow.length : 4 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ServiceCard key={i} service={r} />
              </Grid>
            )
          })}
        </Grid>
      ) : null}
      {showMore && (
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            mt: 2
          }}
        >
          <Button
            onClick={() => setNumberResult(num => num + RESULT_NUMBER)}
            variant="contained"
            color="primary"
          >
            Voir plus
          </Button>
        </Box>
      )}
    </Container>
  )
}
