import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "../contexts/TranslationContext";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border-t border-gray-700 ${
        isOpen ? "bg-gray-700" : "bg-gray-800"
      } transition-all duration-200`}
    >
      <div
        className="flex justify-between items-center p-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-lg sm:text-base lg:text-xl text-white px-1">
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
  );
};

const FAQ: React.FC = () => {
  const t = useTranslations("faq");

  const faqs = [
    {
      question: t("question4"),
      answer: t("answer4"),
    },
    {
      question: t("question1"),
      answer: t("answer1"),
    },
    {
      question: t("question2"),
      answer: t("answer2"),
    },
    {
      question: t("question3"),
      answer: t("answer3"),
    },
  ];

  return (
    <section className="container py-4 lg:py-10 mx-auto" id="faq">
      <h3 className="text-center text-3xl sm:text-4xl text-white">{t("title")}</h3>
      <div className="mt-8 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
