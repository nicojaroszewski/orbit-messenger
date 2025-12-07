import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { ConvexClientProvider } from "@/providers/convex-provider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-cosmic-midnight text-star-white antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#3B82F6",
              colorBackground: "#111827",
              colorText: "#F8FAFC",
              colorInputBackground: "#1F2937",
              colorInputText: "#F8FAFC",
            },
            elements: {
              formButtonPrimary: "btn-primary",
              card: "glass",
              headerTitle: "text-star-white",
              headerSubtitle: "text-nebula-gray",
              socialButtonsBlockButton: "btn-secondary",
              formFieldLabel: "text-nebula-gray",
              formFieldInput: "input-orbit",
              footerActionLink: "text-orbit-blue hover:text-stellar-violet",
            },
          }}
        >
          <ConvexClientProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
