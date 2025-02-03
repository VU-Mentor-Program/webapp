import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/mp_logo-CIRCLE.png"; 
import { useTranslations } from "../contexts/TranslationContext";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = useTranslations("header");

  const navLinks = [
    { name: t("link1"), path: "/placeholder1" },
    { name: t("link2"), path: "/placeholder2" },
    { name: t("link3"), path: "/placeholder3" },
  ];

  return (
    <header className="absolute top-5 left-0 right-0 px-4 flex items-center justify-between">
      {/* Left side: Logo + Title */}
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <Link
          to="/"
          className="text-white text-lg font-bold hover:text-gray-300 transition"
        >
          {t("title")}
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-white hover:text-gray-300 transition"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Hamburger Icon */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-gray-300 transition focus:outline-none"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 right-4 bg-gray-800 rounded shadow-md md:hidden">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:text-gray-300 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
