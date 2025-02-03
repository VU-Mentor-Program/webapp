import React from "react";
import { SocialLinks } from "./social-link";

export const Footer: React.FC = () => {
  return (
    <footer className="text-xs text-white mt-auto p-10 bg-gray-800 px-4 md:px-24">
      <div className="flex justify-between items-center">
        <SocialLinks />
        <span>© 2025</span>
      </div>
    </footer>
  );
};
