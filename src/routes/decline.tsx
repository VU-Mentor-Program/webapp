import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { StatusMessage } from "../components/status-message";

const Decline = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            const baseApiUrl = searchParams.get("api_url"); // Get the base API URL
            if (baseApiUrl) {
                // Extract all other query parameters except 'api_url'
                const params = new URLSearchParams(searchParams);
                params.delete("api_url"); // Remove the base URL parameter itself

                // Build the full fetch URL
                const fetchUrl = `${baseApiUrl}&${params.toString()}`;
                console.log("fetchUrl:", fetchUrl);

                try {
                    const response = await fetch(fetchUrl);
                    if (!response.ok) {
                        alert(`Error: ${response.status} - ${response.statusText}`);
                    }
                } catch (error: any) {
                    alert("Failed to fetch: " + error.message);
                }
            } else {
                console.error("API URL (api_url) not provided in query parameters");
            }
        };

        fetchData();
    }, [searchParams]);

    return (
        <StatusMessage
            title="Cancelled Spot"
            message="Thank you for cancelling and giving a spot to someone else 😊"
        />
    );
};

export default Decline;