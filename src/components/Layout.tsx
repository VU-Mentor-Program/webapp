import React from "react";
import { Header } from "./header";
import { BackgroundMusic } from "./BackgroundMusic";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-800">
      <Header />
      <BackgroundMusic volume={0.1} />
      <main className="flex-1 pt-20">
        {children}
      </main>
    </div>
  );
};