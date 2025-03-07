import React from "react";
import { Logo } from "./logo";
import { LoadingAnimation } from "./LoadingAnimation";
import { ErrorAnimation } from "./ErrorAnimation";
import { SuccessAnimation } from "./SuccessAnimation";
import { useTranslations } from "../contexts/TranslationContext";

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

  const t = useTranslations("statusMessage");

  if (!apiUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
        <h1 className="text-3xl">{t("missing_API_URL")}</h1>
        <p className="text-xl">{t("no_API_provided")}</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
          <LoadingAnimation />
      </div>
    );
  }

  if (status === "error") {
    const errorMessage =
      type === "accept"
        ? t("error_accept")
        : t("error_decline");

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
          <ErrorAnimation />
          <h1 className="text-3xl">{t("error")}</h1>
          <p className="text-xl">{errorMessage}</p>
          <p className="text-xl"> {t("suggestion")} </p>
      </div>
    );
  }

  if (status === "success") {
    const isAccept = type === "accept";

    const title = isAccept ? t("title_accept") : t("title_decline");
    const message = isAccept
      ? t("thank_you_accept")
      : t("thank_you_decline");

    const textColorClass = isAccept ? "text-green-400" : "text-red-400";

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-5">
        <Logo />
          {isAccept && <SuccessAnimation />}

          <h1 className={`text-3xl ${textColorClass} pb-3`}>{title}</h1>
          <p className="text-xl">{message}</p>
      </div>
    );
  }

  return null;
};
