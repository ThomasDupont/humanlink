import { trpc } from '@/utils/trpc'

export const useCrudService = () => {
  const { mutateAsync: upsertService } = trpc.protectedMutation.service.upsert.useMutation()
  const { mutateAsync: deleteService } = trpc.protectedMutation.service.delete.useMutation()
  const { data: userServices, refetch: refetchUserServices } =
    trpc.protectedGet.userServices.useQuery()

  return { upsertService, deleteService, userServices: userServices ?? [], refetchUserServices }
}
