"use client";

import { useSyncExternalStore } from "react";
import { getSession, subscribeSession } from "@/lib/session";

// Returns the logged-in user (or null until it loads on the client).
export default function useSession() {
    return useSyncExternalStore(subscribeSession, getSession, () => null);
}
