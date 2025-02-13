import { Service } from "@/types/Services.type";

export type SearchProvider = ({ query }: { query: string}) => Promise<Service[]>
