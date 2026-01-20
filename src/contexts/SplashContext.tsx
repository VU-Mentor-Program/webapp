import React, { createContext, useContext, useEffect, useState } from "react";

interface SplashContextType {
  splashRemoved: boolean;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export const SplashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splashRemoved, setSplashRemoved] = useState(false);

  useEffect(() => {
    const handleSplashRemoved = () => {
      setSplashRemoved(true);
    };

    window.addEventListener("splashRemoved", handleSplashRemoved);

    return () => {
      window.removeEventListener("splashRemoved", handleSplashRemoved);
    };
  }, []);

  return (
    <SplashContext.Provider value={{ splashRemoved }}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error("useSplash must be used within a SplashProvider");
  }
  return context;
};
