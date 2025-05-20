import React from "react";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "./Fadein-Wrapper";
import { FormAccordionItem } from "./FormItem";

export interface FormItem {
  link: string;
  title: string;
}

interface FormsAccordionProps {
  forms: FormItem[];
  translation: string;
}

export const FormsAccordion: React.FC<FormsAccordionProps> = ({ forms, translation }) => {
  const t = useTranslations(translation);

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
