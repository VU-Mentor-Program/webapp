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
        <div className="container mx-auto flex flex-col items-center text-center space-y-4 w-full">
          <Logo />

          <h1 className="text-2xl font-bold w-full">{t("title")}</h1>
          <h2 className="text-xl w-full">{t("subtitle")}</h2>

          <div className="max-w-2xl mx-auto px-6 py-4 bg-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm" style={{maxWidth: '600px', whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>
            <p className="text-base leading-relaxed" style={{whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>
              {t("text")}
            </p>
          </div>

          <JoinCommunityButton />
          <SocialLinks />
        </div>
      </section>
    </FadeIn>
  );
};

export default Hero;
