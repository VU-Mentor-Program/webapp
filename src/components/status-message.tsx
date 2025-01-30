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
  type: "accept" | "decline";
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  apiUrl,
  type,
}) => {
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
    const errorMessage =
      type === "accept"
        ? "Something went wrong while accepting your spot."
        : "Something went wrong while declining your spot.";

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          <ErrorAnimation />
          <h1 className="text-3xl">Error</h1>
          <p className="text-xl">{errorMessage}</p>
          <p className="text-xl">
            Please try using a different browser. If that doesn't work, contact
            the Mentor Team!
          </p>
        <Footer />
      </div>
    );
  }

  if (status === "success") {
    const isAccept = type === "accept";

    const title = isAccept ? "Accepted Spot" : "Cancelled Spot";
    const message = isAccept
      ? "Thank you for accepting your spot! 😊"
      : "Thank you for cancelling and giving a spot to someone else!";

    const textColorClass = isAccept ? "text-green-400" : "text-red-400";

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <Header />
          {isAccept && <SuccessAnimation />}

          <h1 className={`text-3xl ${textColorClass} pb-3`}>{title}</h1>
          <p className="text-xl">{message}</p>
        <Footer />
      </div>
    );
  }

  return null;
};
