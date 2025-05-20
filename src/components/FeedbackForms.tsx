import React from "react";
import { useTranslations } from "../contexts/TranslationContext";
import { FormsAccordion, FormItem } from "./FormsAccordion";

export const FeedbackForms: React.FC = () => {
  const t = useTranslations("forms");

  const forms: FormItem[] = [
    { link: "https://forms.gle/WWzUVcNN1hpVgkuY7", title: t("exam_title") },
    { link: "https://forms.gle/NDtvPasTzUwHpeBT7", title: t("feedback_title") },
  ];

  return <FormsAccordion forms={forms} translation="forms" />;
};
