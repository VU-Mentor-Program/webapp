import { FaGithub, FaInstagram, FaWhatsapp, FaGoogleDrive } from "react-icons/fa";

const SocialIcon = ({ children, ...rest }: React.LinkHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:opacity-80 no-underline">
      {children}
    </a>
  );
}

export const SocialLinks = () => {
  return (
    <div className="flex justify-center gap-2.5 mt-2.5 pb-5">
      <SocialIcon href="https://github.com/VU-Mentor-Program">
        <FaGithub />
      </SocialIcon>
      <SocialIcon href="https://www.instagram.com/vumentorprogram/">
        <FaInstagram />
      </SocialIcon>
      <SocialIcon href="https://chat.whatsapp.com/DtzNHL2mZo1LNTlYruM0Sx">
        <FaWhatsapp />
      </SocialIcon>
      <SocialIcon href="https://drive.google.com/drive/folders/1F-RjBrZq7mie_sZjr_oJwLzC6VyjvHO8?usp=sharing">
        <FaGoogleDrive />
      </SocialIcon>
    </div>
  );
};
