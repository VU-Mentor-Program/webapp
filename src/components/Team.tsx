import React from "react";
import clsx from "clsx";
import TiltedCard from "./TiltedCard";
import { CircleFlag } from 'react-circle-flags';
import { mentorTeam } from "../data/mentorTeam";
import { useIntl } from "react-intl";
import FadeIn from "./Fadein-Wrapper";
import { teamPhotos } from '../assets/images';

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

const Team: React.FC<TeamProps> = ({ title, description, background }) =>
  {
  const intl = useIntl();

  const members: IMember[] = mentorTeam.members ?? [];
  const topThree = members.slice(0, 3);
  const bottomFour = members.slice(3, 7);
  const extraMembers = members.slice(7);

  const toTiltedCard = (m: IMember) => {
    const role = intl.formatMessage({
      id: `roles.${m.study?.toLowerCase() ?? "defaultRole"}`,
      defaultMessage: m.study ?? "Member",
    });

    const overlayContent = (
      <div className="relative w-full h-full pointer-events-none">
        {m.country && (
          <div className="absolute top-2 right-2">
            <CircleFlag
              countryCode={m.country.toLowerCase()}
              className="rounded-full shadow-lg"
              width="32"
              height="32"
            />
          </div>
        )}
      </div>
    );

    return (
      <div key={m.name} className="w-[220px] md:w-[250px] flex flex-col items-center flex-shrink-0">
        <a
          href={m.linkedin_github}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4"
        >
          <TiltedCard
            imageSrc={m.photo || teamPhotos.defaultPerson}
            altText={m.full_name}
            captionText={`Connect with ${m.full_name}`}
            containerHeight="250px"
            containerWidth="220px"
            imageHeight="250px"
            imageWidth="220px"
            scaleOnHover={1.08}
            rotateAmplitude={12}
            showTooltip={true}
            overlayContent={overlayContent}
            displayOverlayContent={true}
          />
        </a>
        <div className="text-center mt-2">
          <p className="text-lg md:text-xl font-bold">{m.full_name}</p>
          <p className="text-sm md:text-base text-gray-300 mt-1">{role}</p>
        </div>
      </div>
    );
  };

  return (
    <FadeIn duration={100} className="mt-6">
      <section id="team" className={clsx(background || "")}>
        <div className={clsx("text-center", description && "mb-4")}>
          <h2 className="text-3xl sm:text-4xl py-4 lg:py-8">{title}</h2>
          {description && <p>{description}</p>}
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Top row: exactly 3, centered */}
          <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-16 mb-16 max-w-5xl mx-auto">
            {topThree.map(toTiltedCard)}
          </div>

          {/* Bottom row: exactly 4 members, centered */}
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-16 max-w-6xl mx-auto">
            {bottomFour.map(toTiltedCard)}
          </div>

          {/* Extra members if any, in additional rows */}
          {extraMembers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-16 mt-16">
              {extraMembers.map(toTiltedCard)}
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
};

export default Team;
