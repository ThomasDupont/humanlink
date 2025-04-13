import { PrismaClient } from "@prisma/client";

export const disputesCrud = (client: PrismaClient) => {
    const createADispute = (args: {
        userId: number
        offerId: number
        text: string
    }) => {
        return client.dispute.create({
            data: {
                ...args,
                decision: 'pending'
            }
        })
    }

    const getConcernedDisputesForOneOffer = (offerId: number, userId: number) => {
        return client.dispute.findMany({
            where: { offerId, userId }
        })
    }

    return { createADispute, getConcernedDisputesForOneOffer }
}