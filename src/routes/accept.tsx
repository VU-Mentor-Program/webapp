import React from "react";
import { useSearchParams } from "react-router";
import { useApiRequest } from "../hooks/useApiRequest";
import { StatusMessage } from "../components/status-message";

const Accept: React.FC = () => {
    const [searchParams] = useSearchParams();
    const status = useApiRequest(searchParams);

    return (
        <StatusMessage
            status={status}
            type="accept"
        />
    );
};

export default Accept;
