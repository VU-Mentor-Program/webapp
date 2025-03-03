import React from "react";
import { Logo } from "./logo";         
import { SocialLinks } from "./social-link";
import { useTranslations } from "../contexts/TranslationContext";
import JoinCommunityButton from "./JoinCommunityButton";
import FadeIn from "./Fadein-Wrapper";

export const Hero: React.FC = () => {
  const t = useTranslations("hero");

  return (
    <FadeIn duration={100}>
      <section className="bg-gray-800 text-white py-10">
        <div className="container mx-auto flex flex-col items-center text-center space-y-4">
          <Logo />

          <h1 className="text-2xl font-bold pt-1">{t("title")}</h1>
          <h2 className="text-1xl pt-1">{t("subtitle")}</h2>

          <p className="text-base pt-1 pb-1 max-w-2xl">
            {t("text")}
          </p>

          <JoinCommunityButton />
          <SocialLinks />
        </div>
      </section>
    </FadeIn>
  );
};

export default Hero;
