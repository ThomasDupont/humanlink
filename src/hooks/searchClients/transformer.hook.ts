"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import { Service } from "../../types/Services.type";
import { HookInterface } from "./hook.interface";

export const useTransformer: HookInterface = () => {
    const worker = useRef<Worker | null>(null);

    const [result, setResult] = useState<Service[]>();
    const [ready, setReady] = useState<boolean>(false);

    // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
    useEffect(() => {
        if (!worker.current) {
            // Create the worker if it does not yet exist.
            worker.current = new Worker(new URL('./transformer-worker.js', import.meta.url), {
                type: 'module'
            });
        }

        // Create a callback function for messages from the worker thread.
        const onMessageReceived = (e: MessageEvent) => { 
            switch (e.data.status) {
            case 'initiate':
                setReady(false);
                break;
            case 'ready':
                setReady(true);
                break;
            case 'complete':
                console.log(e.data.output)
                setResult(e.data.output)
                break;
            }
        };

        // Attach the callback function as an event listener.
        worker.current.addEventListener('message', onMessageReceived);

        // Define a cleanup function for when the component is unmounted.
        return () => worker.current!.removeEventListener('message', onMessageReceived);
    });

    const query = useCallback((text: string) => {
        if (worker.current) {
            worker.current.postMessage({ text });
        }
    }, []);

    return { query, ready, result }
}
