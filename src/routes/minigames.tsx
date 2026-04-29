import React from "react";
import { PageTransition } from "../components/PageTransition";
import { useTranslations } from "../contexts/TranslationContext";
import { seagullImages } from "../assets/images";

export const MinigamesPage: React.FC = () => {
  const t = useTranslations("minigames");

  return (
    <PageTransition>
      <div
        className="min-h-screen text-white"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          paddingTop: '6rem',
          paddingBottom: '4rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        <div
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '42rem',
            margin: '0 auto',
          }}
        >
          <img
            src={seagullImages.confused}
            alt="Confused seagull"
            className="w-32 h-32 md:w-44 md:h-44 mb-8 object-contain"
            style={{
              display: 'block',
              margin: '0 auto 2rem auto',
            }}
          />

          <div
            className="bg-gray-900/40 border border-pink-500/30 rounded-2xl p-6 md:p-10 backdrop-blur-sm shadow-lg"
            style={{ display: 'block', width: '100%' }}
          >
            <h1
              className="text-3xl md:text-5xl font-bold mb-4 text-white"
              style={{ display: 'block', width: '100%' }}
            >
              {t("under_construction_title")}
            </h1>

            <p
              className="text-base md:text-lg text-gray-200 leading-relaxed"
              style={{
                display: 'block',
                width: '100%',
                wordBreak: 'normal',
                overflowWrap: 'break-word',
              }}
            >
              {t("under_construction_desc")}
            </p>

            <div
              className="text-yellow-400"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '2rem',
              }}
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-base md:text-lg font-semibold tracking-wide">
                {t("coming_soon")}
              </span>
            </div>
          </div>

          <a
            href="#/"
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 no-underline"
            style={{ display: 'inline-block', marginTop: '2.5rem' }}
          >
            {t("back_home")}
          </a>
        </div>
      </div>
    </PageTransition>
  );
};
