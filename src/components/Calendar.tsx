import React from "react";

export const Calendar: React.FC = () => {
  return (
    <div id="calendar" className="flex justify-center items-center w-full mt-5">
      <iframe
        title="Mentor Program Agenda"
        src="https://calendar.google.com/calendar/u/0/embed?src=c_ac81bc7a0a4f7a062a5623f650e0086ae298a507bf3af92e6df7083d1f1a3b20@group.calendar.google.com&ctz=Europe/Brussels"
        style={{ border: 0, borderRadius: 10 }}
        width="800"
        height="600"
        frameBorder="0"
        scrolling="no"
      />
    </div>
  );
};
