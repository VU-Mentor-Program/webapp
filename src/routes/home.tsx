import { Calendar } from "../components/Calendar";
import { Link } from "react-router-dom";
import Team from "../components/Team";
import { IntlProvider } from "react-intl";
import FAQ from "../components/FAQ"
import Hero from "../components/Hero"
import { useTranslations } from "../contexts/TranslationContext";
import HomeCarousel from "../components/Carousel"
import FadeIn from "../components/Fadein-Wrapper";
import { FormsAccordion } from "../components/FormsAccordion";
import { MusicButton } from "../components/MusicButton";

const locale = "nl";

export default function Home() {
  const t = useTranslations("team");
  return (
      <div className="flex flex-col min-h-screen text-white text-center px-5">
      <div className="flex-grow flex flex-col items-center justify-center">
        <IntlProvider
          locale={locale}
          defaultLocale="en"
          onError={(err) => {
            if (err.code === 'MISSING_TRANSLATION') {
              // Ignore missing translation errors
              return;
            }
            throw err;
          }}
        >
          <Hero />
          <HomeCarousel />
          <FAQ />
          <Team title={t("title")} description={t("subtitle")} />
          <FormsAccordion />
          <Calendar />

          <FadeIn duration={100} className="mt-6">
            <Link
              to="/minigames"
              className="mt-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {t("minigames")}
            </Link>
          </FadeIn>

          {/* Easter egg music button at bottom */}
          <div className="mt-12 mb-8 flex flex-col items-center gap-3">
            <span className="text-pink-300 text-sm font-semibold tracking-wide">
              Nox's Little Jukebox :)
            </span>
            <MusicButton className="bg-gradient-to-r from-blue-900 via-pink-900 to-pink-500 hover:from-blue-800 hover:via-pink-800 hover:to-pink-400 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-pink-500/50 hover:scale-110" />
          </div>
        </IntlProvider>
      </div>
    </div>
  );
}
