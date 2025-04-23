import React from "react";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "./Fadein-Wrapper";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface FormItem {
  link: string;
  title: string;
}

const FormAccordionItem: React.FC<FormItem> = ({ link, title }) => {
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

export const FormsAccordion: React.FC = () => {
  const t = useTranslations("forms");

  const forms: FormItem[] = [
    { link: "https://forms.gle/WWzUVcNN1hpVgkuY7", title: t("exam_title") },
    { link: "https://forms.gle/NDtvPasTzUwHpeBT7", title: t("feedback_title") },
  ];

  return (
    <FadeIn duration={100} className="mt-6">
      <section className="container py-4 lg:py-10 mx-auto" id="help-us-out">
        <h3 className="text-center text-3xl sm:text-4xl text-white mb-4">
          {t("help_us")}
        </h3>
        <p className="text-gray-300 mb-8">
          {t("prompt")}
        </p>

        <div className="mt-8 max-w-4xl mx-auto">
          {forms.map((f, i) => (
            <FormAccordionItem key={i} link={f.link} title={f.title} />
          ))}
        </div>
      </section>
    </FadeIn>
  );
};
