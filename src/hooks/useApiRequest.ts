import { useState, useEffect } from "react";

type FetchStatus = "idle" | "loading" | "success" | "error";

// Simplified hook without external API dependency
export function useApiRequest(allParams: URLSearchParams) {
    const [status, setStatus] = useState<FetchStatus>("idle");

    useEffect(() => {
        // External APIs have been disabled for reliability
        // This would normally handle event accept/decline functionality
        setStatus("success");
    }, [allParams]);

    return status;
}
