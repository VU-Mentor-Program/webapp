import { IntlProvider } from "react-intl";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "../components/Fadein-Wrapper";
import { PageTransition } from "../components/PageTransition";
import EventCarousel from "../components/EventCarousel";
import { eventGalleries } from "../assets/images";
import SectionWrapper from "../components/SectionWrapper";

const locale = "nl";

export default function Events() {
  const t = useTranslations("events");

  return (
    <PageTransition>
      <div className="min-h-screen text-white" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
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
          {/* Hero-like intro */}
          <div style={{ display: 'block', width: '100%', paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <FadeIn duration={100} className="w-full">
              <div style={{ display: 'block', width: '100%', maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ display: 'block', width: '100%', marginBottom: '1rem' }}>
                  {t("title")}
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed" style={{ display: 'block', width: '100%' }}>
                  {t("subtitle")}
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Event Galleries */}
          <SectionWrapper label="Event Galleries" divider={true}>
            <div style={{ display: 'block', width: '100%' }}>
              {Object.entries(eventGalleries).map(([key, gallery]) => (
                <div key={key} style={{ marginBottom: '4rem' }}>
                  <EventCarousel
                    images={gallery.images}
                    title={t(gallery.title)}
                    subtitle={gallery.subtitle ? t(gallery.subtitle) : undefined}
                    description={t(gallery.description)}
                    autoPlay={true}
                    showIndicators={true}
                  />
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* More Events Coming Soon */}
          <SectionWrapper label="Stay Tuned" divider={true} glass={true}>
            <div style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              <h2 className="text-2xl font-semibold text-blue-400" style={{ display: 'block', width: '100%', marginBottom: '1rem' }}>
                More Events Coming Soon!
              </h2>
              <p className="text-gray-400 leading-relaxed" style={{ display: 'block', width: '100%', maxWidth: '36rem', margin: '0 auto' }}>
                We're constantly organizing events for you guys.
                New photo galleries will be added here as we capture more memories together!
                Keep showing up and you might appear in the next gallery. ;p
              </p>
            </div>
          </SectionWrapper>

          {/* Footer */}
          <footer className="border-t border-white/10" style={{ marginTop: '2rem', paddingTop: '2rem', paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Back to top
              </button>
            </div>
          </footer>
        </IntlProvider>
      </div>
    </PageTransition>
  );
}

/*
  HOW TO ADD NEW EVENT GALLERIES BY GONCALOOOOO (you are welcome bitch):
  
  1 Add images to: public/assets/images/events/[event-type]/
  2   Update src/assets/images/index.ts eventGalleries:
  
     newEventType: {
       title: "new_event_title", // Add to translations
       description: "new_event_desc", // Add to translations  
       images: [
         '/webapp/assets/images/events/new-event/image1.png',
         '/webapp/assets/images/events/new-event/image2.png',
       ],
     },
  
  3. Add translations to en.json and nl.json:
     "new_event_title": "Event Title",
     "new_event_desc": "Description of the event",
  
  That's it bitch 
*/
