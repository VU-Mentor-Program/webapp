import { Header } from "../components/header";
import { SocialLinks } from "../components/social-link";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";
import { Calendar } from "../components/Calendar";
import { Link } from "react-router-dom";
import Team from "../components/Team";
import { IntlProvider } from "react-intl";
import FAQ from "../components/FAQ"
import Hero from "../components/Hero"

const locale = "nl";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
      <Header />
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
          <FAQ />
          <Team title={"Team"} description={"Meet our amazing team"} />
          <Link
            to="/minigames"
            className="mt-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            🕹️ Play Minigames! 🕹️
          </Link>
          <Calendar />
        </IntlProvider>
      </div>
      <Footer />
    </div>
  );
}
