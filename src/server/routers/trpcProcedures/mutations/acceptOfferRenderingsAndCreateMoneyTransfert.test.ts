import { afterEach, describe, expect, it, vi } from "vitest";
import { Effect as T } from 'effect'
import { acceptOfferRenderingsAndCreateMoneyTransfertEffect } from "./acceptOfferRenderingsAndCreateMoneyTransfert";
import { Logger } from "@/server/logger";
import { balanceOperations, BalanceOperations, OfferOperations, offerOperations, TransactionOperations, transactionOperations } from "@/server/databaseOperations/prisma.provider";
import config from "@/config";


describe('test acceptOfferRenderingsAndCreateMoneyTransfert', () => {
    const loggerErrorMock = vi.fn()
        const transactionOperationsMock = {
            acceptOfferRenderingsAndCreateMoneyTransfertTransaction: vi.fn()
          }

        const balanceOperationsMock = {
            getUserBalance: vi.fn()
        }
        const offerOperationsMock = {
            getAnAcceptedAndTerminatedOfferByIdAndReceiverId: vi.fn()
        }
        afterEach(() => {
            vi.restoreAllMocks()
          })
    it('Should do the procedure without error', async () => {
        offerOperationsMock.getAnAcceptedAndTerminatedOfferByIdAndReceiverId.mockResolvedValue({
            id: 1,
            userId: 3,
            milestone: [{
                id: 10,
                priceMilestone: {
                    number: 1000
                }
            }, {
                id: 11,
                priceMilestone: {
                    number: 200
                }
            }]
        })
        balanceOperationsMock.getUserBalance.mockResolvedValueOnce({id: 10})
        transactionOperationsMock.acceptOfferRenderingsAndCreateMoneyTransfertTransaction.mockResolvedValueOnce(true)

        const fees = 1200 * config.fees
        const netAmount = 1200 - fees
        await acceptOfferRenderingsAndCreateMoneyTransfertEffect({
            offerId: 1,
            userId: 2
        }).pipe(
                T.provideService(Logger, { error: loggerErrorMock }),
                T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
                T.provideService(
                  TransactionOperations,
                  transactionOperationsMock as unknown as typeof transactionOperations
                ),
                T.provideService(
                  BalanceOperations,
                  balanceOperationsMock as unknown as typeof balanceOperations
                ),
                T.runPromise
              )

              expect(transactionOperationsMock.acceptOfferRenderingsAndCreateMoneyTransfertTransaction).toHaveBeenCalledWith({
                amount: netAmount,
                offerId: 1,
                fees,
                userId: 2,
                sellerId: 3,
                balanceId: 10
            })
    })
})