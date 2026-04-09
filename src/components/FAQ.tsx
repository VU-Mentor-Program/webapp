import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "./Fadein-Wrapper";
import ScrollReveal from "./ScrollReveal";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FadeIn duration={index * 80}>
      <div
        className={`rounded-lg mb-3 transition-all duration-300 ${
          isOpen
            ? "bg-white/10 backdrop-blur-md border border-white/15 border-l-2 border-l-pink-500 shadow-lg shadow-pink-500/5"
            : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8"
        }`}
      >
        <div
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h4 className="text-lg sm:text-base lg:text-xl text-white px-1 text-left">
            {question}
          </h4>
          <div className={`faq-icon ${isOpen ? "open" : ""}`}>
            <PlusIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className={`faq-content ${isOpen ? "open" : ""}`}>
          <p className="p-6 pt-0 text-gray-300">{answer}</p>
        </div>
      </div>
    </FadeIn>
  );
};

const FAQ: React.FC = () => {
  const t = useTranslations("faq");

  const faqs = [
    { question: t("question4"), answer: t("answer4") },
    { question: t("question1"), answer: t("answer1") },
    { question: t("question2"), answer: t("answer2") },
    { question: t("question3"), answer: t("answer3") },
    { question: t("question5"), answer: t("answer5") },
    { question: t("question6"), answer: t("answer6") },
    { question: t("question7"), answer: t("answer7") },
    { question: t("question8"), answer: t("answer8") },
  ];

  return (
    <>
      <ScrollReveal
        baseRotation={0}
        containerClassName="text-center mb-8"
        textClassName="text-3xl sm:text-4xl text-white"
      >
        {t("title")}
      </ScrollReveal>
      <div className="max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
        ))}
      </div>
    </>
  );
};

export default FAQ;
