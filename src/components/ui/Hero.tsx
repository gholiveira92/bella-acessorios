"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&h=1080&fit=crop&q=80",
    alt: "Mulher elegante com acessórios",
    title: "Detalhes que transformam seu estilo",
    subtitle: "Peças delicadas criadas para mulheres sofisticadas.",
    cta: "Ver Coleção",
    ctaLink: "/catalog",
    ctaSecondary: "Comprar Agora",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&h=1080&fit=crop&q=80",
    alt: "Acessórios femininos premium",
    title: "Elegância em cada momento",
    subtitle: "Acessórios que refletem sua essência.",
    cta: "Explorar",
    ctaLink: "/catalog?sort=newest",
    ctaSecondary: "Ver Lançamentos",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920&h=1080&fit=crop&q=80",
    alt: "Joias e acessórios dourados",
    title: "Sua beleza nos pequenos detalhes",
    subtitle: "Coleção exclusiva 2026.",
    cta: "Comprar Agora",
    ctaLink: "/catalog",
    ctaSecondary: "Ver Coleção",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].alt}
              className="w-full h-full object-cover"
              loading={currentSlide === 0 ? "eager" : "lazy"}
            />
            {/* Overlay leve bege para profundidade */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7F2EA]/40 via-[#F7F2EA]/20 to-[#F7F2EA]/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mx-auto px-4 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-4 md:mb-6 leading-[1.2] drop-shadow-lg"
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-sm md:text-lg text-white/90 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed drop-shadow-md"
            >
              {slides[currentSlide].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 md:gap-4"
            >
              <Link
                href={slides[currentSlide].ctaLink}
                className="px-6 py-3 md:px-8 md:py-3.5 bg-white text-brand-gold-dark rounded-full font-sans text-sm font-medium hover:bg-brand-bg-light transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {slides[currentSlide].cta}
              </Link>
              <Link
                href={slides[currentSlide].ctaLink}
                className="px-6 py-3 md:px-8 md:py-3.5 bg-white/20 backdrop-blur-sm text-white border border-white/40 rounded-full font-sans text-sm font-medium hover:bg-white/30 transition-all duration-300"
              >
                {slides[currentSlide].ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              currentSlide === index ? "bg-white w-8" : "bg-white/40 w-4 hover:bg-white/60"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 right-6 md:right-10 hidden md:flex flex-col items-center gap-2 text-white/50">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}