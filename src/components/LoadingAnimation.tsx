import React from "react";

export const LoadingAnimation: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <div className="spinner" />
      <p>Loading... Please wait.</p>

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
