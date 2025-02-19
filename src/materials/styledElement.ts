import { Grid2, styled } from "@mui/material";

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
      boxShadow: `0px 0px 2px 2px ${theme.palette.primary.main}`,
    }
  }))
