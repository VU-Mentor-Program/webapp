import React from "react";
import { useTranslations } from "../contexts/TranslationContext";

export const JoinCommunityButton: React.FC = () => {
  const t = useTranslations("hero");
  return (
    <a
      href="https://chat.whatsapp.com/DtzNHL2mZo1LNTlYruM0Sx"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      {t("join")}
    </a>
  );
};

export default JoinCommunityButton;
