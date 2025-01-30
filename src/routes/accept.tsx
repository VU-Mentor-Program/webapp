import React from "react";
import { useSearchParams } from "react-router";
import { useApiRequest } from "../hooks/useApiRequest";
import { StatusMessage } from "../components/status-message";

const Accept: React.FC = () => {
  const [searchParams] = useSearchParams();
  const apiUrl = searchParams.get("api_url") || null;
  const status = useApiRequest(apiUrl, searchParams);

  return <StatusMessage status={status} apiUrl={apiUrl} />;
};

export default Accept;
