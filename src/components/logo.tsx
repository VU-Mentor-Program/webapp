// Import organized logo from assets
import { logoImages } from "../assets/images";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center rounded-full pt-16">
      <img
        className="w-24 h-24 mb-4 rounded-full bg-gradient-to-b from-emerald-600 via-teal-700 to-blue-900"
        src={logoImages.white}
        alt="Mentor Program Logo"
      />
    </div>
  );
};