import React from "react";
import { useTranslations } from "../contexts/TranslationContext";

export const JoinCommunityButton: React.FC = () => {
  const t = useTranslations("hero");
  return (
    <a
      href="https://chat.whatsapp.com/FwlVVsDaq418675c9ehFW7"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      {t("join")}
    </a>
  );
};

export default JoinCommunityButton;
