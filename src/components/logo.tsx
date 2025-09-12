// Import organized logo from assets
import { logoImages } from "../assets/images";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center rounded-full pt-20">
      <img 
        className="size-30 mb-5 rounded-full bg-white br-50" 
        src={logoImages.primary} 
        alt="Mentor Program Logo" 
      />
    </div>
  );
};