"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { notify } from "@/lib/notify";

export default function Providers({ children }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 15_000, retry: (n, e) => n < 2 && ![401, 403, 404].includes(e.status) },
                },
                mutationCache: new MutationCache({
                    onError: (e) => notify.error(e.message),
                    // eslint-disable-next-line react-hooks/immutability
                    onSuccess: () => client.invalidateQueries(), // anything saved refreshes everything related
                }),
            })
    );

    return (
        <QueryClientProvider client={client}>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: { background: "#0d1424", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
                }}
            />
        </QueryClientProvider>
    );
}