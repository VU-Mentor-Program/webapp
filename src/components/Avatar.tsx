import React from 'react';
import { CircleFlag } from 'react-circle-flags';
import { teamPhotos } from '../assets/images';

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
    src = teamPhotos.defaultPerson;
  }
  return (
    <div className="w-[186px] h-[196px] flex flex-col items-center text-center pb-5" style={{width: '186px', height: '196px', minWidth: '186px'}}>
      <a href={linkedin_github} target="_blank" rel="noopener noreferrer">
        <div className="relative w-24 h-24" style={{width: '96px', height: '96px'}}>
          <img
            src={src} 
            alt={alt} 
            className="rounded-full object-cover w-full h-full" 
            style={{borderRadius: '50%', width: '96px', height: '96px'}}
            onError={(e) => {
              e.currentTarget.src = teamPhotos.defaultPerson;
            }}
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
      <p className="pt-5 text-lg font-bold leading-5" style={{width: '186px', whiteSpace: 'normal'}}>{alt}</p>
      <div style={{width: '186px'}}>
        <p className="pt-3 pb-3 text-sm leading-5" style={{whiteSpace: 'normal'}}>{role}</p>
      </div>
    </div>
  );
};

export default Avatar;
