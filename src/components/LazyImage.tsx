import React, { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = "", style = {} }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={style} className="relative w-full h-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
      <div
        className={`absolute inset-0 bg-gray-700 filter blur-lg transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      ></div>
    </div>
  );
};

export default LazyImage;
