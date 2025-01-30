import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="absolute top-5 left-5 text-lg font-bold">
      <Link to="/" className="text-white hover:text-gray-300 transition">
        Mentor Program
      </Link>
    </header>
  );
};
