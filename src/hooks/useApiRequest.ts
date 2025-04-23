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

        const separator = apiUrl.includes("?") ? "&" : "?";
        const fetchUrl = `${apiUrl}${separator}${params.toString()}`;

        const response = await fetch(fetchUrl, {
          method: "GET",
          redirect: "follow",
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
  }, [apiUrl, allParams]);

  return status;
}
