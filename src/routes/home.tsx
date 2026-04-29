import { Calendar } from "../components/Calendar";
import { Link } from "react-router-dom";
import Team from "../components/Team";
import { IntlProvider } from "react-intl";
import FAQ from "../components/FAQ"
import Hero from "../components/Hero"
import { useTranslations } from "../contexts/TranslationContext";
import HomeCarousel from "../components/Carousel"
import { FormsAccordion } from "../components/FormsAccordion";
import { MusicButton } from "../components/MusicButton";
import { PageTransition } from "../components/PageTransition";
import TeamPopup from "../components/TeamPopUp/teamPopup";
import SectionWrapper from "../components/SectionWrapper";
import Stats from "../components/Stats";
import { SocialLinks } from "../components/social-link";
import { logoImages, seagullImages } from "../assets/images";
import { useState } from "react";

const locale = "nl";

export default function Home() {
  const t = useTranslations("team");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen text-white text-center">
        <IntlProvider
          locale={locale}
          defaultLocale="en"
          onError={(err) => {
            if (err.code === 'MISSING_TRANSLATION') {
              return;
            }
            throw err;
          }}
        >
          {/* Hero — full viewport landing */}
          <Hero />

          {/* Gallery */}
          <SectionWrapper label="Gallery" divider={true}>
            <HomeCarousel />
          </SectionWrapper>

          {/* Impact Stats */}
          <SectionWrapper id="impact" label="Event Stats This Year" divider={true} glass={true}>
            <p className="text-gray-500 text-xs italic" style={{ textAlign: "center", marginTop: "-4px", marginBottom: "16px" }}>
              Excluding non-signup events such as study sessions and exam preps
            </p>
            <Stats />
          </SectionWrapper>

          {/* FAQ */}
          <SectionWrapper id="faq" label="FAQ" divider={true} glass={true}>
            <FAQ />
          </SectionWrapper>

          {/* Team */}
          <SectionWrapper id="team" label="Team" divider={true}>
            <Team title="Meet the 2025-2026 Team" onMemberClick={setSelectedMember} />
          </SectionWrapper>

          {/* Feedback Forms */}
          <SectionWrapper id="help-us-out" label="Feedback" divider={true} glass={true}>
            <FormsAccordion />
          </SectionWrapper>

          {/* Calendar */}
          <SectionWrapper id="calendar" label="Schedule" divider={true}>
            <Calendar />
          </SectionWrapper>

          {/* Footer */}
          <footer className="mt-8 border-t border-white/10 pt-12 pb-8 px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
              <img
                className="w-16 h-16 rounded-full bg-white"
                src={logoImages.black}
                alt="Mentor Program Logo"
              />
              <p className="text-gray-400 text-sm -mt-4">
                Mentor Program for CS & AI — VU Amsterdam
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/minigames"
                  className="bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-full text-white hover:bg-white/10 transition-all duration-300 hover:border-pink-500/30 no-underline"
                >
                  {t("minigames")}
                </Link>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-full">
                  <span className="text-pink-300 text-sm font-semibold">Nox's Jukebox</span>
                  <MusicButton className="text-white hover:text-pink-400 transition-colors" />
                </div>
              </div>

              <img 
                src={seagullImages.normal} 
                alt="Seagull mascot" 
                className="w-24 h-24 md:w-28 md:h-28 object-contain opacity-60 hover:opacity-100 transition-opacity mt-4"
              />

              <SocialLinks />

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Back to top
              </button>

              <p className="text-gray-600 text-xs italic">what are you doing down here, go back up, nothing to see here</p>
            </div>
          </footer>

          {selectedMember && (
            <TeamPopup
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
            />
          )}
        </IntlProvider>
      </div>
    </PageTransition>
  );
}
