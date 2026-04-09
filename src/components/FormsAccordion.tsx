import React from "react";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "./Fadein-Wrapper";
import ScrollReveal from "./ScrollReveal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface FormItem {
  link: string;
  title: string;
}

interface FormAccordionItemProps extends FormItem {
  index: number;
}

const FormAccordionItem: React.FC<FormAccordionItemProps> = ({ link, title, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FadeIn duration={index * 100}>
      <div
        className={`rounded-lg overflow-hidden mb-4 transition-all duration-300 ${
          isOpen
            ? "bg-white/10 backdrop-blur-md border border-white/15 border-l-2 border-l-blue-500 shadow-lg shadow-blue-500/5"
            : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8"
        }`}
      >
        <div
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => setIsOpen((o) => !o)}
        >
          <h4 className="text-xl text-white">{title}</h4>
          <PlusIcon
            className={`h-6 w-6 text-white transform transition-transform duration-200
                        ${isOpen ? "rotate-45" : ""}`}
          />
        </div>

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
    </FadeIn>
  );
};

export const FormsAccordion: React.FC = () => {
  const t = useTranslations("forms");

  const forms: FormItem[] = [
    { link: "https://forms.gle/WWzUVcNN1hpVgkuY7", title: t("exam_title") },
    { link: "https://forms.gle/NDtvPasTzUwHpeBT7", title: t("feedback_title") },
  ];

  return (
    <>
      <ScrollReveal
        baseRotation={0}
        containerClassName="text-center mb-4"
        textClassName="text-3xl sm:text-4xl text-white"
      >
        {t("help_us")}
      </ScrollReveal>
      <p className="text-gray-300 mb-8 text-center">
        {t("prompt")}
      </p>
      <div className="max-w-4xl mx-auto">
        {forms.map((f, i) => (
          <FormAccordionItem key={i} link={f.link} title={f.title} index={i} />
        ))}
      </div>
    </>
  );
};
