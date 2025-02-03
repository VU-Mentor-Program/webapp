import React from "react";
import { useTranslations } from "../contexts/TranslationContext";

export const JoinCommunityButton: React.FC = () => {
  const t = useTranslations("hero");
  return (
    <a
      href="https://chat.whatsapp.com/I6CQX1yyYM830oTZks5lX7"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
    >
      {t("join")}
    </a>
  );
};

export default JoinCommunityButton;
