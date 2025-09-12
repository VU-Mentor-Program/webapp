import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { logoImages } from "../assets/images";
import { useTranslations, useSetLanguage, useCurrentLanguage } from "../contexts/TranslationContext";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderHidden, setHeaderHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const t = useTranslations("header");
  const setLanguage = useSetLanguage();
  const currentLanguage = useCurrentLanguage();

  // Navigation links array.
  const navLinks = [
    { name: t("link1"), path: "#faq" },
    { name: t("link2"), path: "#team" },
    { name: t("link3"), path: "#calendar" },
    { name: t("link4"), path: "/minigames" },
    { name: t("link5"), path: "/events" },
    { name: t("link6"), path: "#help-us-out" },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      // If we're on a routed page (hash starts with "#/") such as minigames,
      // navigate to the homepage with the anchor.
      if (window.location.hash.startsWith("#/")) {
        window.location.href = "/webapp";
      } else {
        // Otherwise, attempt smooth scrolling.
        const elementId = path.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
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
        className={`fixed left-0 right-0 px-4 md:px-24 py-4 flex items-center z-50 
          bg-slate-800 bg-opacity-95 backdrop-blur-sm rounded transition-transform duration-300 
          ${isHeaderHidden ? "-translate-y-20" : "translate-y-0"} md:translate-y-0`}
      >
        {/* Left Section: Logo + Title */}
        <div className="flex items-center space-x-3 flex-1">
          <img src={logoImages.primary} alt="Logo" className="h-10 w-10" />
          <Link
            to="/"
            className="text-white text-lg font-bold hover:text-slate-300 transition"
          >
            {t("title")}
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden md:flex space-x-6 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path.startsWith("/") ? link.path : "#"}
              onClick={(e) => handleAnchorClick(e, link.path)}
              className="text-white hover:text-slate-300 transition whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Section: Language Switcher */}
        <div className="hidden md:flex items-center space-x-2 flex-1 justify-end">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 transition-colors ${currentLanguage === "en" ? "bg-slate-700 rounded" : ""}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("nl")}
            className={`px-3 py-1 transition-colors ${currentLanguage === "nl" ? "bg-slate-700 rounded" : ""}`}
          >
            NL
          </button>
        </div>

        {/* Mobile: Hamburger Icon & Language Switcher */}
        <div className="md:hidden flex items-center space-x-2 z-50">
          <select
            onChange={(e) => setLanguage(e.target.value)}
            value={currentLanguage}
            className="bg-transparent text-white border border-slate-600 rounded p-1 focus:outline-none"
          >
            <option value="en">EN</option>
            <option value="nl">NL</option>
          </select>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-slate-300 transition focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Side Menu with Blur Overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:text-slate-300 transition focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path.startsWith("/") ? link.path : "#"}
              onClick={(e) => handleAnchorClick(e, link.path)}
              className="text-white hover:text-slate-300 transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
