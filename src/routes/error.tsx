import React from "react";
import { Logo } from "../components/logo";
import { useTranslations } from "../contexts/TranslationContext";
import { SocialLinks } from "../components/social-link";

export const ErrorPage: React.FC = () => {
    const t = useTranslations("errorPage");

    return (
        <div className="flex flex-col items-center justify-center h-screen text-white text-center px-5">
            <Logo />

            {/* Red X Icon */}
            <div className="mb-8 text-6xl animate-pulse">❌</div>

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
                className="inline-block bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {t("back_home")}
            </a>

            {/* Social Links */}
            <SocialLinks />
        </div>
    );
};

export default ErrorPage;
