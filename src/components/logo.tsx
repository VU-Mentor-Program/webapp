// Import organized logo from assets
import { logoImages } from "../assets/images";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center rounded-full pt-16">
      <img 
        className="w-24 h-24 mb-4 rounded-full bg-white" 
        src={logoImages.primary} 
        alt="Mentor Program Logo" 
      />
    </div>
  );
};