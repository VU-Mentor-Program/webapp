import React from "react";
import { useSearchParams } from "react-router";
import { useApiRequest } from "../hooks/useApiRequest";
import { StatusMessage } from "../components/status-message";
import { PageTransition } from "../components/PageTransition";

const Decline: React.FC = () => {
    const [searchParams] = useSearchParams();
    const status = useApiRequest(searchParams);

    return (
        <PageTransition>
            <StatusMessage
                status={status}
                type="decline"
            />
        </PageTransition>
    );
};

export default Decline;
