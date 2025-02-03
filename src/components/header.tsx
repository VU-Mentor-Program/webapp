import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/mp_logo-CIRCLE.png";
import { useTranslations } from "../contexts/TranslationContext";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderHidden, setHeaderHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const t = useTranslations("header");

  const navLinks = [
    { name: t("link1"), path: "#faq" },
    { name: t("link2"), path: "#team" },
    { name: t("link3"), path: "#calendar" },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const elementId = path.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    }
  };

  // Mobile header hide on scroll down, show on scroll up.
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        const currentScrollPos = window.pageYOffset;
        if (currentScrollPos > prevScrollPos && currentScrollPos > 50) {
          setHeaderHidden(true);
        } else {
          setHeaderHidden(false);
        }
        setPrevScrollPos(currentScrollPos);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <>
      {/* Header */}
      <header
        onClick={() => setHeaderHidden(false)}
        className={`fixed left-0 right-0 px-4 py-2 flex items-center justify-between z-50 
                    bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded transition-transform duration-300 
                    ${isHeaderHidden ? "-translate-y-20" : "translate-y-0"} md:translate-y-0`}
      >
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
              onClick={(e) => handleAnchorClick(e, link.path)}
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
      </header>

      {/* Mobile Side Menu with Blur Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Overlay with blur effect on the rest of the screen */}
          <div
            className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-200 opacity-100"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Side Menu */}
          <div
            className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out z-50 translate-x-0"
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
                  onClick={(e) => handleAnchorClick(e, link.path)}
                  className="text-white hover:text-gray-300 transition"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};
