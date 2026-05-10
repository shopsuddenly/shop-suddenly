"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface HeroSlide {
  id: string;
  image: string;
  videoUrl?: string;
  type?: 'image' | 'video';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  if (!slides || slides.length === 0) return null;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <section className="relative h-[92vh] w-full overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
          )}
        >
          {/* Background Media */}
          <div className="absolute inset-0">
            {slide.type === 'video' && slide.videoUrl ? (
              <video
                src={slide.videoUrl}
                poster={slide.image}
                autoPlay
                muted
                loop
                playsInline
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
            {/* Multi-layer Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          </div>

          {/* Content */}
          <div className="relative h-full container flex items-center pt-24 pb-32">
            <div className="max-w-3xl space-y-6 md:space-y-8">
              <div
                className={cn(
                  "transition-all duration-1000 delay-300 px-2 md:px-0",
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
              >
                <div className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.25em] mb-6 shadow-xl">
                  {slide.subtitle}
                </div>
                <h1 className="text-[3.5rem] md:text-display-lg lg:text-display-xl text-white leading-[0.95] mb-6 tracking-tighter font-bold">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className="inline-block mr-3 md:mr-4">
                      {word === 'Suddenly' ? (
                         <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">{word}</span>
                      ) : word}
                    </span>
                  ))}
                </h1>
                <p className="text-base md:text-xl text-white/70 max-w-md md:max-w-xl leading-relaxed mb-10 font-medium">
                    Curated essentials for the modern lifestyle. Premium craftsmanship meets sustainable materials.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    <Link href={slide.ctaLink} className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white text-black hover:bg-white/90 group text-base font-bold shadow-2xl">
                        {slide.ctaText}
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/shop" className="w-full sm:w-auto">
                       <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-2xl border-white/20 bg-black/20 text-white hover:bg-white hover:text-black text-base font-bold backdrop-blur-md transition-all">
                          View Collections
                       </Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 flex items-center gap-4 z-20">
        <div className="flex items-center gap-2 mr-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  index === currentSlide
                    ? "w-10 bg-primary shadow-lg shadow-primary/50"
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
        </div>
        
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="w-12 h-12 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black backdrop-blur-md"
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="w-12 h-12 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black backdrop-blur-md"
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
      </div>

      {/* Side Progress Text */}
      <div className="absolute left-12 bottom-12 hidden md:block z-20">
         <div className="flex items-end gap-2 text-white/40 font-display">
            <span className="text-4xl font-bold text-white">0{currentSlide + 1}</span>
            <span className="text-xl mb-1">/ 0{slides.length}</span>
         </div>
      </div>
    </section>
  );
}
