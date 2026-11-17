"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/services/authService";

// Returns the logged-in user (or null until it loads on the client).
export default function useSession() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        setSession(getSession());
    }, []);

    return session;
}