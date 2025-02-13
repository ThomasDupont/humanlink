import { Service } from "../types/Services.type";

export type HookInterface = () => {
    query: (text: string) => void;
    ready: boolean;
    result: Service[] | undefined;
}
