import React, { useState } from "react";
import { StatusCheckerModal } from "./StatusCheckerModal";
import { FaClipboardCheck } from "react-icons/fa";

export const FloatingStatusButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40
                         bg-gradient-lava
                         text-white p-4 rounded-full shadow-2xl
                         hover:scale-110 transition-all duration-300"
                aria-label="Check Event Status"
                title="Check Event Status"
            >
                <FaClipboardCheck className="w-6 h-6" />
            </button>

            {/* Modal */}
            {isOpen && <StatusCheckerModal onClose={() => setIsOpen(false)} />}
        </>
    );
};
