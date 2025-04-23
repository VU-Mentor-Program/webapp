import React from "react";
import FadeIn from "./Fadein-Wrapper";

interface GoogleFormProps {
  link: string;
  title: string;
}

export const GoogleForm: React.FC<GoogleFormProps> = ({ link, title }) => {
  return (
    <FadeIn duration={100} className="flex justify-center items-center w-full mt-5 mb-6">
      <div className="flex justify-center items-center w-full mt-5">
        <iframe
          title={title}
          src={link}
          style={{ border: 0, borderRadius: 10 }}
          width="800"
          height="600"
        />
      </div>
    </FadeIn>
  );
}