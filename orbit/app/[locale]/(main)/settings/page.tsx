"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Input, Avatar } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import {
  User,
  Bell,
  Globe,
  Palette,
  Shield,
  LogOut,
  Check,
  Loader2,
  Camera,
} from "lucide-react";

type Tab = "profile" | "notifications" | "language" | "appearance" | "privacy";

export default function SettingsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const currentUserData = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const tabs = [
    { id: "profile" as Tab, icon: User, label: t("profile.title") },
    { id: "notifications" as Tab, icon: Bell, label: t("settings.notifications") },
    { id: "language" as Tab, icon: Globe, label: t("settings.language") },
    { id: "appearance" as Tab, icon: Palette, label: t("settings.appearance") },
    { id: "privacy" as Tab, icon: Shield, label: t("settings.privacy") },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={listItem} className="space-y-2">
          <h1 className="text-3xl font-bold text-star-white">
            {t("settings.title")}
          </h1>
          <p className="text-nebula-gray">{t("settings.general")}</p>
        </motion.div>

        <motion.div variants={listItem} className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 shrink-0">
            <Card variant="glass">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-orbit-blue/20 text-orbit-blue"
                            : "text-nebula-gray hover:text-star-white hover:bg-lunar-graphite/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-flare-red hover:bg-flare-red/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t("common.signOut")}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <ProfileSettings
                user={user}
                userData={currentUserData}
                t={t}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                userData={currentUserData}
                userId={user?.id || ""}
                t={t}
              />
            )}
            {activeTab === "language" && (
              <LanguageSettings
                userData={currentUserData}
                userId={user?.id || ""}
                locale={locale}
                t={t}
              />
            )}
            {activeTab === "appearance" && (
              <AppearanceSettings
                userData={currentUserData}
                userId={user?.id || ""}
                t={t}
              />
            )}
            {activeTab === "privacy" && <PrivacySettings t={t} />}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface ProfileSettingsProps {
  user: ReturnType<typeof useUser>["user"];
  userData: {
    name: string;
    username: string;
    bio?: string;
    status?: string;
    avatarUrl?: string;
  } | null | undefined;
  t: ReturnType<typeof useTranslations>;
}

function ProfileSettings({ user, userData, t }: ProfileSettingsProps) {
  const [name, setName] = useState(userData?.name || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [status, setStatus] = useState(userData?.status || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        clerkId: user.id,
        name: name || undefined,
        bio: bio || undefined,
        status: status || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
    setIsSaving(false);
  };

  return (
    <Card variant="glass">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-star-white">
          {t("profile.editProfile")}
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={userData?.avatarUrl || user?.imageUrl}
              name={userData?.name || "User"}
              size="xl"
            />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orbit-blue flex items-center justify-center text-white hover:bg-orbit-blue/80 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="font-medium text-star-white">{userData?.name}</p>
            <p className="text-sm text-nebula-gray">@{userData?.username}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-star-white mb-2">
              {t("profile.displayName")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.displayName")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-star-white mb-2">
              {t("profile.status")}
            </label>
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder={t("profile.statusPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-star-white mb-2">
              {t("profile.bio")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.bioPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 bg-lunar-graphite/50 border border-white/10 rounded-xl text-star-white placeholder:text-nebula-gray focus:outline-none focus:ring-2 focus:ring-orbit-blue/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? t("common.save") + "d" : t("common.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationSettingsProps {
  userData: { settings: { notifications: boolean } } | null | undefined;
  userId: string;
  t: ReturnType<typeof useTranslations>;
}

function NotificationSettings({ userData, userId, t }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState(
    userData?.settings?.notifications ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = useMutation(api.users.updateSettings);

  const handleToggle = async (value: boolean) => {
    setNotifications(value);
    setIsSaving(true);
    try {
      await updateSettings({
        clerkId: userId,
        settings: { notifications: value },
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
    setIsSaving(false);
  };

  return (
    <Card variant="glass">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-star-white">
          {t("settings.notifications")}
        </h2>

        <div className="space-y-4">
          <ToggleSetting
            label={t("settings.enableNotifications")}
            description={t("settings.desktopNotifications")}
            enabled={notifications}
            onToggle={handleToggle}
            loading={isSaving}
          />

          <ToggleSetting
            label={t("settings.soundEnabled")}
            description="Play sound for new messages"
            enabled={true}
            onToggle={() => {}}
          />

          <ToggleSetting
            label={t("settings.emailNotifications")}
            description="Receive email for important updates"
            enabled={false}
            onToggle={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface LanguageSettingsProps {
  userData: { settings: { language: string } } | null | undefined;
  userId: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function LanguageSettings({ userData, userId, locale, t }: LanguageSettingsProps) {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(
    userData?.settings?.language || locale
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = useMutation(api.users.updateSettings);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    setIsSaving(true);
    try {
      await updateSettings({
        clerkId: userId,
        settings: { language: langCode as "en" | "ru" },
      });
      // Navigate to the new locale
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(`/${locale}`, `/${langCode}`);
      router.push(newPath);
    } catch (error) {
      console.error("Failed to update language:", error);
    }
    setIsSaving(false);
  };

  return (
    <Card variant="glass">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-star-white">
          {t("settings.language")}
        </h2>

        <div className="grid gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isSaving}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                selectedLanguage === lang.code
                  ? "border-orbit-blue bg-orbit-blue/10"
                  : "border-white/10 hover:border-white/20 bg-lunar-graphite/30"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-star-white">{lang.name}</span>
              {selectedLanguage === lang.code && (
                <Check className="w-5 h-5 text-orbit-blue ml-auto" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AppearanceSettingsProps {
  userData: { settings: { theme: string } } | null | undefined;
  userId: string;
  t: ReturnType<typeof useTranslations>;
}

function AppearanceSettings({ userData, userId, t }: AppearanceSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState(
    userData?.settings?.theme || "dark"
  );

  const themes = [
    { id: "dark", name: t("settings.themeDark"), icon: "🌙" },
    { id: "light", name: t("settings.themeLight"), icon: "☀️" },
    { id: "system", name: t("settings.themeSystem"), icon: "💻" },
  ];

  return (
    <Card variant="glass">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-star-white">
          {t("settings.appearance")}
        </h2>

        <div>
          <label className="block text-sm font-medium text-nebula-gray mb-3">
            {t("settings.theme")}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedTheme === theme.id
                    ? "border-orbit-blue bg-orbit-blue/10"
                    : "border-white/10 hover:border-white/20 bg-lunar-graphite/30"
                }`}
              >
                <span className="text-2xl">{theme.icon}</span>
                <span className="text-sm font-medium text-star-white">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PrivacySettingsProps {
  t: ReturnType<typeof useTranslations>;
}

function PrivacySettings({ t }: PrivacySettingsProps) {
  return (
    <Card variant="glass">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-star-white">
          {t("settings.privacy")}
        </h2>

        <div className="space-y-4">
          <ToggleSetting
            label={t("settings.showOnlineStatus")}
            description="Let others see when you're online"
            enabled={true}
            onToggle={() => {}}
          />

          <ToggleSetting
            label={t("settings.readReceipts")}
            description="Show when you've read messages"
            enabled={true}
            onToggle={() => {}}
          />

          <ToggleSetting
            label={t("settings.typingIndicators")}
            description="Show when you're typing a message"
            enabled={true}
            onToggle={() => {}}
          />
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-flare-red font-medium mb-2">
            {t("settings.deleteAccount")}
          </h3>
          <p className="text-sm text-nebula-gray mb-4">
            {t("settings.deleteAccountWarning")}
          </p>
          <Button variant="secondary" className="text-flare-red border-flare-red/50 hover:bg-flare-red/10">
            {t("settings.deleteAccount")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  loading?: boolean;
}

function ToggleSetting({
  label,
  description,
  enabled,
  onToggle,
  loading,
}: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-lunar-graphite/30">
      <div>
        <p className="font-medium text-star-white">{label}</p>
        <p className="text-sm text-nebula-gray">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-orbit-blue" : "bg-lunar-graphite"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
