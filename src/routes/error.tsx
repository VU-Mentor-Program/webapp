import React from "react";
import { Logo } from "../components/logo";
import { useTranslations } from "../contexts/TranslationContext";
import { SocialLinks } from "../components/social-link";
import { seagullImages } from "../assets/images";

export const ErrorPage: React.FC = () => {
    const t = useTranslations("errorPage");

    return (
        <div className="flex flex-col items-center justify-center h-screen text-white text-center px-5">
            <Logo />

            {/* Confused Seagull */}
            <img 
                src={seagullImages.confused} 
                alt="Confused seagull" 
                className="w-32 h-32 md:w-40 md:h-40 mb-8 object-contain"
                style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />

            {/* Error Message */}
            <div className="mb-8 w-full px-8" style={{ maxWidth: '800px' }}>
                <div className="bg-gray-900/40 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg" style={{ width: '100%', minWidth: '300px' }}>
                    <p className="text-lg leading-relaxed" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', wordWrap: 'break-word', width: '100%', display: 'block', minWidth: '250px' }}>
                        {t("message")}
                    </p>
                </div>
            </div>

            {/* Back to Home Button */}
            <a
                href="#/"
                className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {t("back_home")}
            </a>

            {/* Social Links */}
            <SocialLinks />
        </div>
    );
};

export default ErrorPage;
