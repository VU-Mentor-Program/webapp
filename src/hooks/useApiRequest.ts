import { useState, useCallback } from "react";
import { API_URL } from "../utils/apiUtils";

type FetchStatus = "idle" | "loading" | "success" | "error";

// The request is only sent when the user clicks the confirm button, never on page load.
// Outlook / Microsoft Defender Safe Links open every link in an email in a headless
// browser (and run its JavaScript) to scan it, so firing on load made the scanner
// accept or decline spots before the recipient had clicked anything.
export function useApiRequest(allParams: URLSearchParams) {
    const [status, setStatus] = useState<FetchStatus>("idle");

    const submit = useCallback(async () => {
        if (!API_URL) {
            return;
        }

        setStatus("loading");

        try {
            const data = {
                email: allParams.get('email'),
                type: allParams.get('type')
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                // Redirect to error page immediately
                window.location.hash = '#/error';
                return;
            }
            setStatus("success");
        } catch {
            // Redirect to error page immediately
            window.location.hash = '#/error';
        }
    }, [allParams]);

    return { status, submit };
}
