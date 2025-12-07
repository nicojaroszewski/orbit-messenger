"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Rocket } from "lucide-react";

export function Footer() {
  const t = useTranslations("landing.footer");
  const params = useParams();
  const locale = params.locale as string;
  const otherLocale = locale === "en" ? "ru" : "en";

  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center">
              <Rocket className="w-5 h-5 text-star-white" />
            </div>
            <div>
              <h3 className="text-star-white font-semibold">Orbit</h3>
              <p className="text-xs text-nebula-gray">{t("tagline")}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${otherLocale}`}
              className="text-sm text-nebula-gray hover:text-orbit-blue transition-colors"
            >
              {otherLocale === "en" ? "English" : "Русский"}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-nebula-gray">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
