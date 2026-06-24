"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const IMAGES = [
  "/images/signup_login_image/Img1.png",
  "/images/signup_login_image/Img2.jpg",
  "/images/signup_login_image/Img3.png",
  "/images/signup_login_image/Img4.png",
];

export default function AuthImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Images */}
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt="Admin Login Background"
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Subtle dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
        </div>
      ))}

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
        <div className="text-white font-serif text-2xl font-bold tracking-wide drop-shadow-md">
          <span className="text-[#a1005b]">Admin</span>Panel
        </div>
      </div>

      {/* Bottom Content aligned to reference image */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center z-10 px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-8 leading-tight drop-shadow-lg font-serif">
          Manage your Saree Empire,<br/>With Elegance
        </h2>
        
        {/* Slider Indicators */}
        <div className="flex space-x-2">
          {IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-white w-8" 
                  : "bg-white/40 hover:bg-white/60 w-6"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
