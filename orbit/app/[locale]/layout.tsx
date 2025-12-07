import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('orbit-theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
              <ThemeProvider defaultTheme="system">
                {children}
              </ThemeProvider>
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
