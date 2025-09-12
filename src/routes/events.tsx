import { IntlProvider } from "react-intl";
import { useTranslations } from "../contexts/TranslationContext";
import { Logo } from "../components/logo";
import FadeIn from "../components/Fadein-Wrapper";
import EventCarousel from "../components/EventCarousel";
import { eventGalleries } from "../assets/images";

const locale = "nl";

export default function Events() {
  const t = useTranslations("events");

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
      <div className="flex-grow flex flex-col items-center justify-center py-10">
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
          {/* Header Section */}
          <FadeIn duration={100}>
            <Logo />
          </FadeIn>

          <FadeIn duration={100}>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </FadeIn>

          {/* Event Galleries */}
          <div className="w-full max-w-6xl mx-auto space-y-16">
            {Object.entries(eventGalleries).map(([key, gallery]) => (
              <EventCarousel
                key={key}
                images={gallery.images}
                title={t(gallery.title)}
                subtitle={gallery.subtitle ? t(gallery.subtitle) : undefined}
                description={t(gallery.description)}
                autoPlay={true}
                showIndicators={true}
                className="mb-16"
              />
            ))}
          </div>

          {/* Easy to add new events section */}
          <FadeIn duration={100}>
            <div className="mt-16 p-8 bg-gray-900/50 rounded-xl border border-gray-700/50 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">📸 More Events Coming Soon!</h2>
              <p className="text-gray-400 leading-relaxed">
                We're constantly organizing amazing events for you guys. 
                New photo galleries will be added here as we capture more memories together!
                Keep showing up and you might appear in the next gallery. ;p
              </p>
            </div>
          </FadeIn>
        </IntlProvider>
      </div>
    </div>
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
