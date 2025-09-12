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
      <section className="text-white py-6">
        <div className="container mx-auto flex flex-col items-center text-center space-y-4">
          <Logo />

          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <h2 className="text-xl">{t("subtitle")}</h2>

          <p className="text-base max-w-2xl px-4">
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
