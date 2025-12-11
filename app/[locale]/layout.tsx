import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { NetworkStatus } from "@/components/ui/network-status";

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
    <html lang={locale} className="light">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#3B82F6",
              colorBackground: "#FFFFFF",
              colorText: "#111827",
              colorInputBackground: "#F9FAFB",
              colorInputText: "#111827",
            },
            elements: {
              formButtonPrimary: "btn-primary",
              card: "bg-white shadow-lg border border-gray-200",
              headerTitle: "text-gray-900",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
              formFieldLabel: "text-gray-700",
              formFieldInput: "bg-gray-50 border-gray-200 text-gray-900",
              footerActionLink: "text-orbit-blue hover:text-stellar-violet",
            },
          }}
        >
          <ConvexClientProvider>
            <NextIntlClientProvider messages={messages}>
              <PWAProvider>
                <NetworkStatus />
                {children}
              </PWAProvider>
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
