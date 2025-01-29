import { useState, useEffect } from "react";

type FetchStatus = "idle" | "loading" | "success" | "error";

export function useApiRequest(apiUrl: string | null, allParams: URLSearchParams) {
  const [status, setStatus] = useState<FetchStatus>("idle");

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    setStatus("loading");

    const fetchData = async () => {
      try {
        const params = new URLSearchParams(allParams);
        params.delete("api_url");

        const fetchUrl = `${apiUrl}?${params.toString()}`;

        const response = await fetch(fetchUrl, {
          "redirect": "follow",
        });

        if (!response.ok) {
          setStatus("error");
        } else {
          setStatus("success");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    fetchData();
  }, [apiUrl, allParams]);

  return status;
}
