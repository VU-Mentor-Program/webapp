import { useState, useEffect } from "react";
import { API_URL } from "../utils/apiUtils";

type FetchStatus = "idle" | "loading" | "success" | "error";

export function useApiRequest(allParams: URLSearchParams) {
    const [status, setStatus] = useState<FetchStatus>("idle");

    useEffect(() => {
        if (!API_URL) {
            return;
        }

        setStatus("loading");

        const fetchData = async () => {
            try {
                const params = new URLSearchParams(allParams);

                const data = {
                    email: params.get('email'),
                    type: params.get('type')
                }

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    setStatus("error");
                    // Redirect to error page after a short delay
                    setTimeout(() => {
                        window.location.hash = '#/error';
                    }, 2000);
                    return;
                } else {
                    setStatus("success");
                }
            } catch (error) {
                setStatus("error");
                // Redirect to error page
                setTimeout(() => {
                    window.location.hash = '#/error';
                }, 2000);
            }
        };

        fetchData();
    }, [allParams]);

    return status;
}
