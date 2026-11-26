"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ORIGIN } from "@/lib/api";

// One socket per logged-in tab. Any change on the server refetches what is on screen.
export default function Realtime() {
    const qc = useQueryClient();
    useEffect(() => {
        const socket = io(ORIGIN || undefined, {
            withCredentials: true,
            addTrailingSlash: Boolean(ORIGIN),
        });
        socket.on("changed", () => qc.invalidateQueries());
        return () => {
            socket.close();
        };
    }, [qc]);
    return null;
}
