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
                    alert(`Error: ${response.status} ${response.statusText}. Please try again or contact us through Whatsapp.`);
                    return;
                } else {
                    setStatus("success");
                }
            } catch (error) {
                setStatus("error");
                alert(`Error. Please try again or contact us through Whatsapp.`);
            }
        };

        fetchData();
    }, [API_URL, allParams]);

    return status;
}
