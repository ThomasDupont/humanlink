import { Message } from "@prisma/client";
import { OfferWithMileStonesAndMilestonePrice } from "./Offers.type";

export type MessageWithMaybeOffer = Message & { offer?: OfferWithMileStonesAndMilestonePrice}