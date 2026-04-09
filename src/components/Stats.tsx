import { Users, CalendarDays, MessageCircle, UserCheck, Trophy, Clock } from "lucide-react";
import { NumberTicker } from "./NumberTicker";
import statsData from "../data/stats.json";
import { useTranslations } from "../contexts/TranslationContext";

const iconMap: Record<string, React.ReactNode> = {
  eventSignups: <Users className="w-7 h-7" />,
  eventsHosted: <CalendarDays className="w-7 h-7" />,
  whatsappMembers: <MessageCircle className="w-7 h-7" />,
  activeMembers: <UserCheck className="w-7 h-7" />,
};

const medalColors = [
  "text-yellow-400",
  "text-gray-300",
  "text-amber-600",
];

function EventList({
  icon,
  title,
  events,
  rankColors,
  delayBase = 0,
}: {
  icon: React.ReactNode;
  title: string;
  events: { name: string; signups: number }[];
  rankColors?: string[];
  delayBase?: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
        {icon}
        <span className="text-sm text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {events.map((event, i) => (
          <div
            key={event.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "12px 18px",
            }}
          >
            <span
              className={rankColors ? rankColors[i] : "text-blue-400"}
              style={{ fontSize: "20px", fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
            >
              #{i + 1}
            </span>
            <span className="text-white" style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>
              {event.name}
            </span>
            <span className="text-gray-400" style={{ fontSize: "13px", flexShrink: 0 }}>
              <NumberTicker value={event.signups} delay={delayBase + 0.15 * i} className="text-gray-400" />
              {" "}sign-ups
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const t = useTranslations("stats");

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {statsData.stats.map((stat, i) => (
          <div
            key={stat.key}
            className="flex flex-col items-center gap-3 py-4"
          >
            <div className="text-pink-400/60">
              {iconMap[stat.key]}
            </div>

            <div className="text-4xl md:text-5xl font-bold text-white">
              <NumberTicker value={stat.value} delay={0.15 * i} className="text-white" />
              {stat.suffix && (
                <span className="text-white">
                  {stat.suffix}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 uppercase tracking-wider">
              {t(stat.key)}
            </p>
          </div>
        ))}
      </div>

      <div className="stats-event-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", paddingTop: "8px" }}>
        <EventList
          icon={<Trophy className="w-5 h-5 text-yellow-400" />}
          title="Most Popular Events"
          events={statsData.topEvents}
          rankColors={medalColors}
          delayBase={0.6}
        />
        <EventList
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          title="Most Recent Events"
          events={statsData.recentEvents}
          delayBase={0.9}
        />
      </div>
    </div>
  );
}
