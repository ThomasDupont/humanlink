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
import VerifiedIcon from '@mui/icons-material/Verified';
import { Tooltip } from '@mui/material';
import { getUserHook } from '@/hooks/users/hook.factory';
import { useEffect, useState } from 'react';
import { User } from '@/types/User.type';

const useUser = getUserHook('fake')

export default function ServiceCard({ service }: { service: Service }) {
  const [user, setUser] = useState<User | null>(null)
    const { getUserById } = useUser()

    useEffect(() => {
      getUserById(service.id).then(setUser)
    }, [service.id])

  return user && (
    <Card sx={{ width: 345, minHeight: 410, display: 'flex', justifyContent: 'flex-end', flexDirection: 'column' }}>
        <Link href={`/service/${service.id}`} target='_blank'>
        <CardHeader
            avatar={<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" src={user.thumbnail} />}
            action={
                <Tooltip title="Profil vérifié">
                    <VerifiedIcon sx={{
                      color: 'primary.dark'
                    }} />
                </Tooltip>
            }
            title={`${user.firstname} ${user.lastname[0]}.`}
            sx={{
              color: 'primary.main'
            }}
            subheader={user.country}
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
