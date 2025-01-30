import React from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Logo } from "./logo";
import { LoadingAnimation } from "./LoadingAnimation";
import { ErrorAnimation } from "./ErrorAnimation";
import { SuccessAnimation } from "./SuccessAnimation";

interface StatusMessageProps {
  status: "loading" | "error" | "success" | "idle"; 
  apiUrl?: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ status, apiUrl }) => {
  if (!apiUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          <h1 className="text-3xl">Missing API URL</h1>
          <p className="text-xl">No api_url provided in the query parameters.</p>
        <Footer />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          <LoadingAnimation />
        <Footer />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          <ErrorAnimation />
          <h1 className="text-3xl">Error</h1>
          <p className="text-xl">Something went wrong while accepting your spot.</p>
          <p className="text-xl">Please try using a different browser and if that doesnt work, contact the Mentor Team!</p>
        <Footer />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          <SuccessAnimation />
          <h1 className="text-3xl">Accepted Spot</h1>
          <p className="text-xl">Thank you for accepting your spot! 😊</p>
        <Footer />
      </div>
    );
  }

  return null;
};
