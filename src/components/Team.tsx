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

  const teamMembers = mentorTeam.members.map((member: IMember) => (
    <Avatar
      key={member.name}
      src={member.photo}
      alt={member.full_name}
      linkedin_github={member.linkedin_github}
      role={
        intl.formatMessage({
          id: `roles.${member.study?.toLowerCase() ?? "defaultRole"}`,
          defaultMessage: member.study ?? "Member",
        })
      }
      country={member.country}
    />
  ));

  return (
    <FadeIn duration={100} className="mt-6">
      <section id="team" className={clsx(background || "")}>
        <div className={clsx("text-center", description && "mb-4")}>
          <h2 className="text-3xl sm:text-4xl py-4 lg:py-8">{title}</h2>
          {description && <p>{description}</p>}
        </div>
          <div className="max-w-4xl mx-auto">
            <div
              className="
                grid justify-center place-items-center gap-x-10 gap-y-12
                [grid-template-columns:repeat(auto-fit,minmax(160px,max-content))]
              "
            >
              {teamMembers}
            </div>
          </div>
      </section>
    </FadeIn>
  );
};

export default Team;
