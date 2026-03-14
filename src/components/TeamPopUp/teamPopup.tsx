import React, { useEffect, useRef } from "react";
import {FaInstagram,FaLinkedin} from "react-icons/fa";
import { motion } from "motion/react";

// data the component expects 
interface MentorInfo {
  member: {
    full_name: string;
    photo: string;
    linkedin_github: string;
    instagramLink: string;
    study: string;
    description:string;
    songName:string;
    songFile:string;
    country:string;
  };
  onClose: () => void;
}

const SocialIcon = ({ children, ...rest }: React.LinkHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:opacity-80 no-underline">
      {children}
    </a>
  );
}

const TeamPopup: React.FC<MentorInfo> = ({ member, onClose }) => {
  
    const audioRef = useRef<HTMLAudioElement | null>(null);  
    useEffect(() => {
    // CREATE — make a new Audio player with this member's song
    const audio = new Audio(member.songFile);
    audio.loop = true;   
    audio.volume = 0.4;     
    audioRef.current = audio; 


    audio.play().catch((err) => {
      console.log("Audio play failed:", err);
    });

    return () => {
      audio.pause();          
      audio.currentTime = 0;   
    };
  }, [member.songFile]);
    
  return (

    // BACKDROP — covers full screen, dark overlay, centers the popup
    <motion.div
        initial={{ opacity: 0 }}     // START: invisible
        animate={{ opacity: 1 }}     // END: fully visible
        transition={{ duration: 0.2 }} // HOW LONG: 0.3 seconds
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
    >
      {/* POPUP CARD — two-column layout */}
      <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-[90vw] max-w-[900px] bg-slate-800 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden "
            onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON — top right corner (one className only!) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-color-tertiary-400 hover:text-white text-2xl z-10 cursor-pointer scale-125"
        >
          &times;
        </button>

        {/* LEFT COLUMN — photo */}
        <div className="md:w-[380px] flex-shrink-0">
          <img
            src={member.photo}
            alt={member.full_name}
            className="w-full h-[250px] md:h-full object-cover"
          />
        </div>

        {/* RIGHT COLUMN — all the info, with responsive padding */}
        <div className="flex flex-col p-4 sm:p-6 flex-1 overflow-y-auto max-h-[80vh]">
          {/* Name — scales up on bigger screens */}
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white">{member.full_name}</h2>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{member.study}</p>

          {/* Description — readable on all sizes */}
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 mt-2 sm:mt-4 leading-relaxed">
            {member.description}
          </p>

          {/* Song */}
          <div className="mt-2 sm:mt-4 text-[10px] sm:text-xs text-pink-300">
            <span className="text-gray-400">Song Choice: </span>
            {member.songName}
          </div>

          {/* Social links — uses the MEMBER's actual links */}
          <div className="flex gap-4 mt-3 sm:mt-4 justify-center ">
            
            <div className="hover:scale-125 transition-transform">
                <SocialIcon href={member.instagramLink} >
                <FaInstagram />
                </SocialIcon>
            </div>

            <div className="hover:scale-125 transition-transform">
            <SocialIcon href={member.linkedin_github}>
              <FaLinkedin />
            </SocialIcon>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};



export default TeamPopup;