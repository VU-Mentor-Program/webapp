import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

interface FormItem {
  link: string;
  title: string;
}

export const FormAccordionItem: React.FC<FormItem> = ({ link, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-700 rounded overflow-hidden mb-4">
      {/* header */}
      <div
        className={`flex justify-between items-center p-6 cursor-pointer 
                    ${isOpen ? "bg-gray-700" : "bg-gray-800"} 
                    transition-colors duration-200`}
        onClick={() => setIsOpen((o) => !o)}
      >
        <h4 className="text-xl text-white">{title}</h4>
        <PlusIcon
          className={`h-6 w-6 text-white transform transition-transform duration-200 
                      ${isOpen ? "rotate-45" : ""}`}
        />
      </div>

      {/* content */}
      <div
        className={`overflow-hidden transition-all duration-300 
                    ${isOpen ? "max-h-[800px] py-6" : "max-h-0"}`}
      >
        {isOpen && (
          <div className="px-6">
            <iframe
              title={title}
              src={link}
              style={{ border: 0, borderRadius: 8 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="yes"
            />
          </div>
        )}
      </div>
    </div>
  );
};