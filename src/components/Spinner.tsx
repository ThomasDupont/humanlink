import { CardMedia } from '@mui/material'

export const Spinner = () => {
  return (
    <CardMedia
      height={100}
      component="img"
      image={'/spinner.gif'}
      alt="service"
      sx={{
        width: '100px',
        display: 'block',
        margin: 'auto'
      }}
    />
  )
}
