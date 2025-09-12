import React from "react";
import { Header } from "./header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-800">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
    </div>
  );
};