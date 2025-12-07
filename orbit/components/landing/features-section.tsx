"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { staggerContainer, listItem } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui";
import { Zap, Users, MessageSquare, Shield } from "lucide-react";

const features = [
  {
    key: "realtime",
    icon: Zap,
    gradient: "from-orbit-blue to-blue-400",
  },
  {
    key: "discover",
    icon: Users,
    gradient: "from-stellar-violet to-purple-400",
  },
  {
    key: "groups",
    icon: MessageSquare,
    gradient: "from-signal-teal to-teal-400",
  },
  {
    key: "privacy",
    icon: Shield,
    gradient: "from-aurora-green to-green-400",
  },
];

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-midnight via-orbital-navy/50 to-cosmic-midnight" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-star-white mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orbit-blue via-stellar-violet to-signal-teal mx-auto rounded-full" />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.key} variants={listItem}>
                <Card
                  variant="glass"
                  interactive
                  className="h-full group relative overflow-hidden"
                >
                  {/* Gradient Glow on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div
                        className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-star-white" />
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-semibold text-star-white mb-2 group-hover:text-orbit-blue transition-colors">
                          {t(`${feature.key}.title`)}
                        </h3>
                        <p className="text-nebula-gray leading-relaxed">
                          {t(`${feature.key}.description`)}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Decorative Corner */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-full`}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-orbital-navy/50 backdrop-blur-sm">
            {/* Mock Chat Interface Preview */}
            <div className="h-full p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet" />
                <div>
                  <p className="text-star-white font-medium">Orbit Team</p>
                  <p className="text-xs text-aurora-green flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-aurora-green animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              {/* Messages Preview */}
              <div className="flex-1 py-4 space-y-3 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="message-received max-w-[70%] px-4 py-2 text-sm"
                >
                  Welcome to Orbit! ✨
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="message-sent max-w-[70%] px-4 py-2 text-sm ml-auto"
                >
                  This looks amazing! 🚀
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2 text-sm text-nebula-gray"
                >
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 bg-signal-teal rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-signal-teal rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-signal-teal rounded-full" />
                  </div>
                  <span>Someone is typing...</span>
                </motion.div>
              </div>

              {/* Input Preview */}
              <div className="flex gap-3">
                <div className="flex-1 h-10 rounded-xl bg-lunar-graphite border border-white/10 flex items-center px-4 text-nebula-gray text-sm">
                  Type a message...
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orbit-blue to-blue-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-star-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orbit-blue/20 via-stellar-violet/20 to-signal-teal/20 rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
