"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui";
import { staggerContainer, listItem, orbitalFloat } from "@/lib/animations";
import { Rocket, Sparkles } from "lucide-react";

// Pre-computed star positions to avoid hydration mismatch
const STARS = Array.from({ length: 50 }, (_, i) => ({
  left: ((i * 17 + 23) % 100),
  top: ((i * 31 + 47) % 100),
  delay: ((i * 7) % 30) / 10,
  opacity: 0.2 + ((i * 13) % 50) / 100,
}));

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 cosmic-bg" />

      {/* Animated Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {STARS.map((star, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-star-white rounded-full twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Orbital Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] border border-orbit-blue/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[800px] h-[800px] border border-stellar-violet/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[1000px] h-[1000px] border border-signal-teal/5 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orbit-blue/20 to-transparent rounded-full blur-2xl"
        variants={orbitalFloat}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-stellar-violet/20 to-transparent rounded-full blur-2xl"
        variants={orbitalFloat}
        initial="initial"
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Logo/Icon */}
        <motion.div
          variants={listItem}
          className="mb-8 inline-flex items-center justify-center"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center orbit-glow">
              <Rocket className="w-10 h-10 text-star-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-signal-teal flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-star-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={listItem}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">{t("title")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={listItem}
          className="text-xl md:text-2xl text-nebula-gray mb-4"
        >
          {t("subtitle")}
        </motion.p>

        {/* Description */}
        <motion.p
          variants={listItem}
          className="text-lg text-nebula-gray/80 mb-10 max-w-2xl mx-auto"
        >
          {t("description")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={listItem}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href={`/${locale}/sign-up`}>
            <Button size="lg" className="min-w-[200px]">
              <Rocket className="w-5 h-5 mr-2" />
              {t("cta")}
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              {t("ctaSecondary")}
            </Button>
          </Link>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          variants={listItem}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "10K+", label: "Users" },
            { value: "1M+", label: "Messages" },
            { value: "50K+", label: "Connections" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-orbit-blue">
                {stat.value}
              </p>
              <p className="text-sm text-nebula-gray">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-nebula-gray/50 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-orbit-blue rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
