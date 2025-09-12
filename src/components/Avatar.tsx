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
    <div className="w-[200px] md:w-[240px] h-[220px] md:h-[260px] flex flex-col items-center text-center pb-5" style={{minWidth: '200px'}}>
      <a href={linkedin_github} target="_blank" rel="noopener noreferrer" className="group">
        <div className="relative w-[120px] md:w-[140px] h-[120px] md:h-[140px] transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
          <img
            src={src} 
            alt={alt} 
            className="rounded-full object-cover w-full h-full transition-all duration-300 ease-in-out group-hover:brightness-110 group-hover:contrast-110" 
            style={{borderRadius: '50%'}}
            onError={(e) => {
              e.currentTarget.src = teamPhotos.defaultPerson;
            }}
          />
          {country && (
            <span className="absolute bottom-[-15px] right-[-5px] transition-all duration-300 ease-in-out group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg">
              <CircleFlag
                countryCode={country.toLowerCase()}
                className="rounded-full border-2 border-white shadow-md"
                width="40"
                height="40"
                style={{width: '40px', height: '40px'}}
              />
            </span>
          )}
        </div>
      </a>
      <p className="pt-6 text-lg md:text-xl font-bold leading-5" style={{width: '200px', whiteSpace: 'normal'}}>{alt}</p>
      <div style={{width: '200px'}}>
        <p className="pt-3 pb-3 text-sm md:text-base leading-5" style={{whiteSpace: 'normal'}}>{role}</p>
      </div>
    </div>
  );
};

export default Avatar;
