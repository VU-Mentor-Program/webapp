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
        </IntlProvider>
      </div>
    </div>
  );
}
