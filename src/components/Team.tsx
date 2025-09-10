import React from "react";
import clsx from "clsx";
import Avatar from "./Avatar";
import { mentorTeam } from "../data/mentorTeam";
import { useIntl } from "react-intl";
import FadeIn from "./Fadein-Wrapper";

interface TeamProps {
  title: string;
  description?: string | React.ReactNode;
  background?: string;
}

interface IMember {
  name: string;
  full_name: string;
  photo: string;
  linkedin_github?: string;
  study?: string;
  country?: string;
}

const Team: React.FC<TeamProps> = ({ title, description, background }) => {
  const intl = useIntl();

  // Split into first two + the rest
  const members: IMember[] = mentorTeam.members ?? [];
  const topTwo = members.slice(0, 2);
  const others = members.slice(2);

  const toAvatar = (m: IMember) => (
    <div key={m.name} className="w-56 flex flex-col items-center">
      <Avatar
        src={m.photo}
        alt={m.full_name}
        linkedin_github={m.linkedin_github}
        role={intl.formatMessage({
          id: `roles.${m.study?.toLowerCase() ?? "defaultRole"}`,
          defaultMessage: m.study ?? "Member",
        })}
        country={m.country}
      />
    </div>
  );

  return (
    <FadeIn duration={100} className="mt-6">
      <section id="team" className={clsx(background || "")}>
        <div className={clsx("text-center", description && "mb-4")}>
          <h2 className="text-3xl sm:text-4xl py-4 lg:py-8">{title}</h2>
          {description && <p>{description}</p>}
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Row 1: exactly two, centered */}
          <div className="flex justify-center gap-x-12 gap-y-10 mb-12">
            {topTwo.map(toAvatar)}
          </div>

          {/* Row 2+: remaining members, centered and wrapping */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-12">
            {others.map(toAvatar)}
          </div>
        </div>
      </section>
    </FadeIn>
  );
};

export default Team;
