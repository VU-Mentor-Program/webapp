import React from 'react';
import { CircleFlag } from 'react-circle-flags';

interface AvatarProps {
  src: string;
  alt: string;
  linkedin_github?: string;
  role?: string;
  country?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  linkedin_github,
  role,
  country,
}) => {

  if (src == "") {
    src = "/webapp/default person.jpg";
  }
  return (
    <div className="w-[186px] h-[196px] flex-col text-center flex justify-center items-center pb-5">
      <a href={linkedin_github} target="_blank" rel="noopener noreferrer">
        <div className="h-20 relative">
          <img
            src={src}
            style={{ borderRadius: "50%" }}
            alt={alt}
            role={alt}
            width={90}
            height={90}
          />
          {country && (
            <span className="bottom-[-11px] right-[-2px] absolute">
              <CircleFlag
                countryCode={country.toLowerCase()}
                className="rounded-full"
                width={36}
              />
            </span>
          )}
        </div>
      </a>
      <p className="w-[186px] pt-5 text-lg font-bold text-center leading-5">
        {alt}
      </p>
      <div className="w-[186px] items-center">
        <p className="pt-3 pb-3 text-sm text-center leading-5">{role}</p>
      </div>
    </div>
  );
};

export default Avatar;
