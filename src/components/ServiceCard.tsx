/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { Service } from '@/types/Services.type';
import axios from 'axios';
import { useEffect, useState } from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Tooltip } from '@mui/material';

const avatars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

const randomProfiles = axios.get('https://randomuser.me/api/?results=20&nat=FR')

export default function ServiceCard({ service }: { service: Service }) {
    const [profiles, setProfiles] = useState([])

    useEffect(() => {
        randomProfiles.then(r => setProfiles(r.data.results))
    }, [])

    const profile: any = profiles[parseInt(service.id, 10) - 1]

  return profile && (
    <Card sx={{ width: 345, minHeight: 402 }}>
        <Link href={`/service/${service.id}`} target='_blank'>
        <CardHeader
            avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" src={profile.picture.thumbnail}>
                {avatars[parseInt(service.id, 10)]}
            </Avatar>
            }
            action={
                <Tooltip title="Profil vérifié">
                    <VerifiedIcon color='primary' />
                </Tooltip>
            }
            title={`${profile.name.first} ${(profile.name.last as string)[0]}.`}
            subheader={profile.location.country}
        />
        <CardMedia
            component="img"
            height="194"
            image={`https://picsum.photos/200/194?random=${service.id}`}
            alt="service"
        />
        <CardContent>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {service.title}
            </Typography>
        </CardContent>
      </Link>
      <CardActions disableSpacing sx={{ mt: "auto" }}>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
