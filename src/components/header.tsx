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
    <header className="absolute top-5 left-0 right-0 px-4 flex items-center justify-between z-50">
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
      <div className="md:hidden z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-gray-300 transition focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Side Menu with Blur Overlay */}
      <>
        {/* Overlay with blur effect */}
        <div
          className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-200 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        {/* Side Menu sliding in/out */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out z-50 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gray-300 transition focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-4">
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
      </>
    </header>
  );
};
