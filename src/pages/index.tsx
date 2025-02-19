import { Box, Button, CardMedia, Container, Grid2 as Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import { FormEvent, useState, KeyboardEvent } from "react";
import ForwardIcon from '@mui/icons-material/Forward';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Search } from "@mui/icons-material";
import { getSearchClientHook } from "../hooks/searchClients/hook.factory";
import ServiceCard from "../components/ServiceCard";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (message) query(message)
  }

  return (
      <Container
        maxWidth="lg"
      >
        <Grid
          container 
          spacing={{ xs: 4, md: 12 }}
          sx={{
            mt: 20,
          }}
        >
          <Grid size={{ xs: 12, md: 6}} sx={(t) => ({
              borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
              boxShadow: 1,
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '16px',
              color: 'secondary',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignContent: 'center',
              alignItems: 'center',
              gap: 4,
              '&:hover': {
                boxShadow: `0px 0px 2px 2px ${t.palette.primary.main}`,
              }
            })}>
            <Typography variant="body1" component="h1" >Nous sélectionnons et certifions nos freelances pour garantir le meilleur à vos projets</Typography>
            <CardMedia
              component="img"
              sx={{ width: 150, height: 100 }}
              image="certified-people.svg"
              alt="Live from space album cover"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6}} sx={(t) => ({
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            boxShadow: 1,
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '16px',
            color: 'secondary',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignContent: 'center',
            alignItems: 'center',
            '&:hover': {
                boxShadow: `0px 0px 2px 2px ${t.palette.primary.main}`,
              }
          })}>
            <Typography variant="body1" component="p">Paiement uniquement après la livraison de votre commande</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 4,
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
          </Grid>
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
                variant='outlined'
                color='primary'
                label="Décrivez votre besoin ou votre projet"
                onChange={e => setMessage(e.target.value)}
                value={message}
                fullWidth
                multiline
                minRows={1}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                slotProps={{
                  input: {
                    endAdornment:
                      <InputAdornment position="end" sx={{
                        mr: 1
                      }}>
                        <IconButton
                          type="submit"
                          edge="end"
                        >
                          <Search color="primary" fontSize='large' />
                        </IconButton>
                      </InputAdornment>
                    
                  },
                  htmlInput: { maxLength: 1000 },
                }}
                sx={() => ({
                  backgroundColor: 'white',
                })}
                />
          </form>
        </Box>
        <Box
          sx={{
            width: '100%',
            mt: 10
          }}
        >
          {ready !== null && (
            <pre className="bg-gray-100 p-2 rounded">
              { !ready ? 'Loading...' :  '' }
            </pre>
          )}
        </Box>
        {resultToShow?.length ? <Grid 
          container 
          spacing={2}
        >
          {resultToShow.map((r, i) => {
            return <Grid key={i} size={{ xs: 12, md: resultToShow.length <= 3 ? (12 / resultToShow.length) : 4 }} sx={{
              display: "flex",
              justifyContent: 'center',
              alignItems: 'center'
            }} >
              <ServiceCard key={i} service={r} />
            </Grid>
          })}
        </Grid> : null}
        {showMore && <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            mt: 2
          }}
        >
          <Button onClick={() => setNumberResult(num => num + RESULT_NUMBER)} variant="contained" color="primary">Voir plus</Button>
        </Box>}
      </Container>
  );
}
