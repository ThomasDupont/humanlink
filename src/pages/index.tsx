import { Box, Button, Container, Grid2 as Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import { FormEvent, useState, KeyboardEvent } from "react";
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
          <Grid size={{ xs: 12, md: 6}}>
            <Typography variant="body1" component="h1" >Nous sélectionnons et certifions nos freelances pour garantir le meilleur à vos projets</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6}}>
            <Typography variant="body1" component="p" fontWeight={500}>Paiement uniquement après la livraison de votre commande</Typography>
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
