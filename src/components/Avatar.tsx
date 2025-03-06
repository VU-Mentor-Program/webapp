import React from 'react';
import { CircleFlag } from 'react-circle-flags';
import LazyImage from './LazyImage';

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
  if (!src) {
    src = "/webapp/default person.jpg";
  }
  return (
    <div className="w-[186px] h-[196px] flex flex-col items-center text-center pb-5">
      <a href={linkedin_github} target="_blank" rel="noopener noreferrer">
        <div className="relative w-24 h-24">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="rounded-full object-cover w-full h-full" 
          />
          {country && (
            <span className="absolute bottom-[-11px] right-[-2px]">
              <CircleFlag
                countryCode={country.toLowerCase()}
                className="rounded-full"
                width={36}
              />
            </span>
          )}
        </div>
      </a>
      <p className="w-[186px] pt-5 text-lg font-bold leading-5">{alt}</p>
      <div className="w-[186px]">
        <p className="pt-3 pb-3 text-sm leading-5">{role}</p>
      </div>
    </div>
  );
};

export default Avatar;
