import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"

export const SwitchText = ({ texts, prefix }: { texts: string[], prefix: string }) => {
    const [current, setCurrent] = useState(0)
    
    useEffect(() => {
      const interval = setInterval(() => {
        if (current === texts.length - 1) {
          setCurrent(0)
        } else {
          setCurrent(c => c + 1)
        }
      }, 4000)
  
      return () => clearInterval(interval)
    })
    
    return <Box
      sx={{
        mt: 1
      }}
    >
      <Typography variant="body1" component="p">{prefix} &#xAB; <i>{texts[current]}</i> &#xBB;</Typography>
    </Box>
  }
  