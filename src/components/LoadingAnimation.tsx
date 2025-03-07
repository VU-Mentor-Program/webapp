import React from "react";
import { useTranslations } from "../contexts/TranslationContext";

export const LoadingAnimation: React.FC = () => {
  const t = useTranslations("statusMessage");

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <div className="spinner" />
      <p>{t("loading")}</p>

      <style>{`
        .spinner {
          margin: 20px auto;
          width: 40px;
          height: 40px;
          border: 6px solid #ccc;
          border-top: 6px solid #333;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
