import { SuportedLocale } from "@/config";
import { useManagePrice } from "@/hooks/managePrice.hook";
import { OfferWithMileStonesAndMilestonePrice } from "@/types/Offers.type";
import { localeToDateFnsLocale } from "@/utils/localeToDateFnsLocale";
import { Box, Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import { format } from "date-fns";

export default function ShowOffer({ offer, user, userIdFromAuth, locale }: { offer: OfferWithMileStonesAndMilestonePrice, locale: SuportedLocale, user: Pick<User, 'firstname' | 'id'>, userIdFromAuth: number | null }) {
    const parsedCreatedDate = format(offer.createdAt, 'PPP', { locale: localeToDateFnsLocale(locale) })

    const { priceCurrencyToDisplayCurrency } = useManagePrice()

    const price = offer.milestones[0]?.priceMilestone

    return (<Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'} sx={t => ({
        backgroundColor: t.palette.secondary[50],
        width: 200,
        height: 300
    })}>
        <Typography variant="h4" component={'p'}>Offer from {user.firstname} of {parsedCreatedDate}</Typography>
        <Typography variant={'body1'}>{offer.description}</Typography>
        {price && <Typography variant="body1">{(price.number / 100).toString()} {priceCurrencyToDisplayCurrency(price.currency)}</Typography>}
        {userIdFromAuth !== user.id && <Button variant="contained" color="primary">Accept offer</Button>} 
    </Box>)
}