import React from "react";
import FadeIn from "./Fadein-Wrapper";
import ScrollReveal from "./ScrollReveal";

export const Calendar: React.FC = () => {
  return (
    <>
      <ScrollReveal
        baseRotation={0}
        containerClassName="text-center mb-8"
        textClassName="text-3xl sm:text-4xl text-white"
      >
        Look what we have planned for this month!
      </ScrollReveal>
      <FadeIn duration={100}>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 max-w-5xl mx-auto overflow-hidden">
          <iframe
            title="Mentor Program Agenda"
            src="https://calendar.google.com/calendar/u/0/embed?src=c_ac81bc7a0a4f7a062a5623f650e0086ae298a507bf3af92e6df7083d1f1a3b20@group.calendar.google.com&ctz=Europe/Brussels"
            className="w-full rounded-xl"
            style={{ border: 0 }}
            height="700"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </FadeIn>
    </>
  );
};
