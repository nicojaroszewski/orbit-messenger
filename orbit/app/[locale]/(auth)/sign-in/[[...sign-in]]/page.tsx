import { SignIn } from "@clerk/nextjs";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Rocket } from "lucide-react";

interface SignInPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signIn");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center orbit-glow">
            <Rocket className="w-6 h-6 text-star-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-star-white">{t("title")}</h1>
        <p className="text-nebula-gray">{t("subtitle")}</p>
      </div>

      {/* Clerk Sign In */}
      <div className="glass rounded-2xl p-6">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-lunar-graphite border border-white/10 text-star-white hover:bg-orbital-navy hover:border-orbit-blue transition-all duration-300",
              socialButtonsBlockButtonText: "text-star-white",
              dividerLine: "bg-white/10",
              dividerText: "text-nebula-gray",
              formFieldLabel: "text-nebula-gray",
              formFieldInput:
                "bg-lunar-graphite border-white/10 text-star-white placeholder:text-nebula-gray focus:border-orbit-blue focus:ring-orbit-blue/20",
              formButtonPrimary:
                "bg-gradient-to-r from-orbit-blue to-blue-600 hover:from-orbit-blue/90 hover:to-blue-600/90 text-star-white",
              footerActionLink: "text-orbit-blue hover:text-stellar-violet",
              identityPreviewText: "text-star-white",
              identityPreviewEditButton: "text-orbit-blue",
              formFieldSuccessText: "text-aurora-green",
              formFieldErrorText: "text-flare-red",
              alertText: "text-star-white",
              formResendCodeLink: "text-orbit-blue",
            },
          }}
          routing="path"
          path={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          fallbackRedirectUrl={`/${locale}/dashboard`}
        />
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-nebula-gray">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/sign-up`}
          className="text-orbit-blue hover:text-stellar-violet transition-colors"
        >
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
