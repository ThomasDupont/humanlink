import { Badge, Grid2, styled } from '@mui/material'

export const StyledGrid = styled(Grid2)(({ theme }) => ({
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  boxShadow: theme.shadows[1],
  textAlign: 'center',
  backgroundColor: 'white',
  padding: '16px',
  color: 'secondary',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
  gap: '16px',
  '&:hover': {
    boxShadow: `0px 0px 2px 2px ${theme.palette.primary[300]}`
  }
}))

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""'
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0
    }
  }
}))
