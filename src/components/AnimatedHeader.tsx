import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from "react-router-dom";
import { logoImages } from "../assets/images";
import { useTranslations, useSetLanguage, useCurrentLanguage } from "../contexts/TranslationContext";
import { HiUserGroup, HiCalendar, HiPencilSquare } from "react-icons/hi2";
import { IoGameController } from "react-icons/io5";
import { MdPhotoLibrary } from "react-icons/md";
import { HiQuestionMarkCircle } from "react-icons/hi2";



export const AnimatedHeader: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHeaderHidden, setHeaderHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const t = useTranslations("header");
  const setLanguage = useSetLanguage();
  const currentLanguage = useCurrentLanguage();

  // Navigation links grouped into categories
  const navCategories = [
    {
      label: "About", // Team & FAQ
      bgColor: '#1e3a8a',
      textColor: '#ffffff',
      links: [
        { name: t("link2"), path: "#team", label: t("link2"), icon: HiUserGroup },
        { name: t("link1"), path: "#faq", label: t("link1"), icon: HiQuestionMarkCircle },
      ]
    },
    {
      label: "Events", // Events & Calendar
      bgColor: '#831843',
      textColor: '#ffffff',
      links: [
        { name: t("link5"), path: "/events", label: t("link5"), icon: MdPhotoLibrary },
        { name: t("link3"), path: "#calendar", label: t("link3"),icon: HiCalendar },
      ]
    },
    {
      label: "Other",
      bgColor: '#ec4899',
      textColor: '#ffffff',
      links: [
        { name: t("link4"), path: "/minigames", label: t("link4"), icon: IoGameController },
        { name: t("link6"), path: "#help-us-out", label: t("link6"), icon: HiPencilSquare },
      ]
    },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Close menu with animation
    const tl = tlRef.current;
    if (tl && isExpanded) {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }

    if (path.startsWith("#")) {
      e.preventDefault();
      if (window.location.hash.startsWith("#/")) {
        window.location.href = "/webapp";
      } else {
        const elementId = path.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // Header hide on scroll down, show on scroll up, always close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      // Close menu on any scroll with animation
      if (isExpanded) {
        const tl = tlRef.current;
        if (tl) {
          tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
          tl.reverse();
        } else {
          setIsExpanded(false);
        }
      }

      if (currentScrollPos > prevScrollPos && currentScrollPos > 50) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, isExpanded]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      // Very compact height for mobile - just enough for the cards
      return 180;
    }
    return 200;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: 'power3.out' });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsExpanded(true);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-[900px] z-50 top-4 transition-transform duration-300 ${
      isHeaderHidden ? '-translate-y-32' : 'translate-y-0'
    }`}>
      <nav
        ref={navRef}
        className={`h-[60px] rounded-xl relative overflow-hidden will-change-[height] bg-gradient-lava bg-opacity-95 backdrop-blur-sm`}
      >
        {/* Top Bar */}
        <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between px-4 md:px-6 z-[2]">
          {/* Hamburger Menu */}
          <div
            className={`group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] md:order-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
          >
            <div
              className={`w-[30px] h-[2px] bg-white transition-transform duration-300 ${
                isExpanded ? 'translate-y-[4px] rotate-45' : ''
              } group-hover:opacity-75`}
            />
            <div
              className={`w-[30px] h-[2px] bg-white transition-transform duration-300 ${
                isExpanded ? '-translate-y-[4px] -rotate-45' : ''
              } group-hover:opacity-75`}
            />
          </div>

          {/* Logo (Centered) */}
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
          >
            <img src={logoImages.primary} alt="Logo" className="h-8 w-8 hidden md:block" />
            <span className="text-white text-sm md:text-lg font-bold hover:text-pink-200 transition">
              {t("title")}
            </span>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switcher - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 transition-colors rounded ${
                  currentLanguage === "en" ? "bg-white/20" : "hover:bg-white/10"
                } text-white text-sm`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("nl")}
                className={`px-3 py-1 transition-colors rounded ${
                  currentLanguage === "nl" ? "bg-white/20" : "hover:bg-white/10"
                } text-white text-sm`}
              >
                NL
              </button>
            </div>

            {/* Language Switcher - Mobile */}
            <select
              onChange={(e) => setLanguage(e.target.value)}
              value={currentLanguage}
              className="md:hidden bg-white/10 text-white border border-white/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-white/50"
            >
              <option value="en" className="bg-gray-900">EN</option>
              <option value="nl" className="bg-gray-900">NL</option>
            </select>
          </div>
        </div>

        {/* Expanded Content - Card Grid */}
        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-row items-stretch gap-2 justify-start z-[1] ${
            isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!isExpanded}
        >
          {navCategories.map((category, idx) => (
            <div
              key={`${category.label}-${idx}`}
              className="relative flex flex-col gap-1.5 p-1.5 md:p-2.5 rounded-xl min-w-0 flex-1 h-auto md:h-full shadow-lg"
              ref={setCardRef(idx)}
              style={{ backgroundColor: category.bgColor, color: category.textColor }}
            >
              <div className="font-semibold tracking-tight text-xs md:text-sm">
                {category.label}
              </div>
              <div className="mt-auto flex flex-col md:flex-row gap-1 md:gap-2 items-stretch flex-1">
                {category.links.map((link, i) => (
                  <Link
                      key={`${link.label}-${i}`}
                      to={link.path.startsWith("/") ? link.path : "#"}
                      onClick={(e) => handleAnchorClick(e, link.path)}
                      className="flex-1 w-full flex items-center justify-center p-1.5 md:py-3 md:px-3
                      bg-white/10 border border-white/20 rounded-lg
                      no-underline cursor-pointer
                      transition-all duration-300 hover:bg-white/25 hover:border-white/50 hover:scale-105"
                  >
                  <link.icon className="text-xl md:text-2xl text-white drop-shadow-sm" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AnimatedHeader;
