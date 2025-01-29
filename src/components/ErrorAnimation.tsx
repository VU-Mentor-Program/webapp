import React from "react";

export const ErrorAnimation: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
      <div style={{ fontSize: "3rem" }}>✖</div>
      <p>Oops! Something went wrong.</p>
    </div>
  );
};
