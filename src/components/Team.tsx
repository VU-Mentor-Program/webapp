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

  const members: IMember[] = mentorTeam.members ?? [];
  const topThree = members.slice(0, 3);
  const bottomFour = members.slice(3, 7); // Exactly 4 on bottom
  const extraMembers = members.slice(7); // Any additional members

  const toAvatar = (m: IMember) => (
    <div key={m.name} className="w-[200px] md:w-[240px] lg:w-[260px] flex flex-col items-center flex-shrink-0">
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

        <div className="max-w-7xl mx-auto px-4">
          {/* Top row: exactly 3, centered */}
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 lg:gap-x-12 gap-y-10 mb-12 max-w-5xl mx-auto">
            {topThree.map(toAvatar)}
          </div>

          {/* Bottom row: exactly 4 members, centered */}
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-12 max-w-6xl mx-auto">
            {bottomFour.map(toAvatar)}
          </div>
          
          {/* Extra members if any, in additional rows */}
          {extraMembers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-12 mt-12">
              {extraMembers.map(toAvatar)}
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
};

export default Team;
