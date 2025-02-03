import { Calendar } from "../components/Calendar";
import { Link } from "react-router-dom";
import Team from "../components/Team";
import { IntlProvider } from "react-intl";
import FAQ from "../components/FAQ"
import Hero from "../components/Hero"
import { useTranslations } from "../contexts/TranslationContext";
import Carousel from "../components/Carousel"
import MonthlyEvents from "../components/MonthlyEvents";
import AttendanceLeaderBoard from "../components/attendanceLeaderboard";

const locale = "nl";

export default function Home() {
  const t = useTranslations("team");
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
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
          <Carousel />
          <MonthlyEvents />
          <FAQ />
          <Team title={t("title")} description={t("subtitle")} />
          <AttendanceLeaderBoard />
          <Calendar />
          <Link
            to="/minigames"
            className="mt-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {t("minigames")}
          </Link>
        </IntlProvider>
      </div>
    </div>
  );
}
