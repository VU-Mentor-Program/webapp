import React from "react";
import { useSearchParams } from "react-router";
import { useApiRequest } from "../hooks/useApiRequest";

import { StatusMessage } from "../components/status-message";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { ErrorAnimation } from "../components/ErrorAnimation";
import { SuccessAnimation } from "../components/SuccessAnimation";

const Decline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const apiUrl = searchParams.get("api_url");

  const status = useApiRequest(apiUrl, searchParams);

  if (!apiUrl) {
    return (
      <StatusMessage
        title="Missing API URL"
        message="No api_url provided in the query parameters."
      />
    );
  }

  if (status === "loading") {
    return <LoadingAnimation />;
  }

  if (status === "error") {
    return (
      <>
        <ErrorAnimation />
        <StatusMessage
          title="Error"
          message="Something went wrong while declining the spot."
        />
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <SuccessAnimation />
        <StatusMessage
          title="Cancelled Spot"
          message="Thank you for cancelling and giving a spot to someone else! 😊"
        />
      </>
    );
  }

  return null;
};

export default Decline;
