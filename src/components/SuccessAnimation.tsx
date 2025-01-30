import React from "react";
import Confetti from "react-confetti";

export const SuccessAnimation: React.FC = () => {
  return (
    <div style={{ position: "relative" }} className="pb-10">
      <Confetti className="!fixed"/>
      <div style={{ textAlign: "center", marginTop: "2rem", color: "green" }}>
        <div style={{ fontSize: "3rem" }}>✓</div>
        <p>Success!</p>
      </div>
    </div>
  );
};
