import { afterEach, describe, expect, it, vi } from "vitest";
import { Effect as T } from 'effect'
import { closeMilestoneEffect } from "./closeMilestone";
import { Logger } from "@/server/logger";
import { OfferOperations, offerOperations, TransactionOperations, transactionOperations } from "@/server/databaseOperations/prisma.provider";

describe('closeMilestone test', () => {
    const loggerErrorMock = vi.fn()
    const transactionOperationsMock = {
        closeMilestoneAndOfferTransaction: vi.fn()
      }
    const offerOperationsMock = {
        getAnOfferByCreatorId: vi.fn()
    }
    afterEach(() => {
        vi.restoreAllMocks()
      })
    it('Should close the milestone with one milestone on the offer', async () => {
        const args = { offerId: 1, userId: 10, milestoneId: 2 }
        offerOperationsMock.getAnOfferByCreatorId.mockResolvedValueOnce({ id: 1, milestone: [{
            id: 2
        }]})
        transactionOperationsMock.closeMilestoneAndOfferTransaction.mockResolvedValueOnce({})

        await closeMilestoneEffect(args).pipe(
            T.provideService(Logger, { error: loggerErrorMock }),
            T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
            T.provideService(
                TransactionOperations,
                transactionOperationsMock as unknown as typeof transactionOperations
            ),
            T.runPromise
        )

        expect(transactionOperationsMock.closeMilestoneAndOfferTransaction).toHaveBeenCalledTimes(1)
        expect(transactionOperationsMock.closeMilestoneAndOfferTransaction).toHaveBeenCalledWith({
            offerId: 1,
            milestoneId: 2,
            hasDoneAllMilestone: true
        })

    })

    it('Should close the milestone with two milestone on the offer', async () => {
        const args = { offerId: 1, userId: 10, milestoneId: 2 }
        offerOperationsMock.getAnOfferByCreatorId.mockResolvedValueOnce({ id: 1, milestone: [{
            id: 2
        }, {
            id: 3
        }]})
        transactionOperationsMock.closeMilestoneAndOfferTransaction.mockResolvedValueOnce({})

        await closeMilestoneEffect(args).pipe(
            T.provideService(Logger, { error: loggerErrorMock }),
            T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
            T.provideService(
                TransactionOperations,
                transactionOperationsMock as unknown as typeof transactionOperations
            ),
            T.runPromise
        )

        expect(transactionOperationsMock.closeMilestoneAndOfferTransaction).toHaveBeenCalledTimes(1)
        expect(transactionOperationsMock.closeMilestoneAndOfferTransaction).toHaveBeenCalledWith({
            offerId: 1,
            milestoneId: 2,
            hasDoneAllMilestone: false
        })

    })
})