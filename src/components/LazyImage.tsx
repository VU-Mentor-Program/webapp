import React, { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden rounded">
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
      <div
        className={`absolute inset-0 bg-gray-300 filter blur-lg transition-opacity duration-500 rounded ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      ></div>
    </div>
  );
};

export default LazyImage;
