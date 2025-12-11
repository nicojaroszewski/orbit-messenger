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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="text-center space-y-4">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Clerk Sign In */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 overflow-hidden w-full flex justify-center">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              cardBox: "w-full mx-auto",
              card: "bg-transparent shadow-none p-0 w-full mx-auto",
              main: "w-full",
              form: "w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300",
              socialButtonsBlockButtonText: "text-gray-700",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700",
              formFieldInput:
                "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orbit-blue focus:ring-orbit-blue/20",
              formButtonPrimary:
                "bg-gradient-to-r from-orbit-blue to-blue-600 hover:from-orbit-blue/90 hover:to-blue-600/90 text-white",
              footerActionLink: "text-orbit-blue hover:text-stellar-violet",
              identityPreviewText: "text-gray-900",
              identityPreviewEditButton: "text-orbit-blue",
              formFieldSuccessText: "text-green-600",
              formFieldErrorText: "text-red-500",
              alertText: "text-gray-900",
              formResendCodeLink: "text-orbit-blue",
              footer: "hidden",
            },
          }}
          routing="path"
          path={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          forceRedirectUrl={`/${locale}/dashboard`}
        />
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-gray-500">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/sign-up`}
          className="text-orbit-blue hover:text-stellar-violet transition-colors font-medium"
        >
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
