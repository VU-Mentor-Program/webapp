import React from "react";
import { Logo } from "./logo";         
import { SocialLinks } from "./social-link";
import { useTranslations } from "../contexts/TranslationContext";

export const Hero: React.FC = () => {
  const t = useTranslations("hero");

  return (
    <section className="bg-gray-800 text-white py-10">
      <div className="container mx-auto flex flex-col items-center text-center space-y-4">
        <Logo />

        <h1 className="text-2xl font-bold pt-1">{t("title")}</h1>
        <h2 className="text-1xl pt-1">{t("subtitle")}</h2>

        <p className="text-base pt-1 pb-1 max-w-2xl">
          {t("text")}
        </p>

        <SocialLinks />
      </div>
    </section>
  );
};

export default Hero;
