"use client";

import { useState, useRef } from "react";
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
  Globe,
  Shield,
  LogOut,
  Check,
  Loader2,
  Camera,
} from "lucide-react";

type Tab = "profile" | "language" | "privacy";

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
    { id: "language" as Tab, icon: Globe, label: t("settings.language") },
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
          <h1 className="text-3xl font-bold text-gray-900">
            {t("settings.title")}
          </h1>
          <p className="text-gray-500">{t("settings.general")}</p>
        </motion.div>

        <motion.div variants={listItem} className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 shrink-0">
            <Card className="bg-white border border-gray-200 shadow-sm">
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
                            ? "bg-orbit-blue/10 text-orbit-blue"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
            {activeTab === "language" && (
              <LanguageSettings
                userData={currentUserData}
                userId={user?.id || ""}
                locale={locale}
                t={t}
              />
            )}
            {activeTab === "privacy" && (
              <PrivacySettings
                userData={currentUserData}
                userId={user?.id || ""}
                t={t}
              />
            )}
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation(api.users.updateProfile);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        const errorText = await result.text();
        console.error("Upload failed:", result.status, errorText);
        throw new Error(`Failed to upload image: ${result.status}`);
      }

      const responseData = await result.json();
      const storageId = responseData.storageId;

      if (!storageId) {
        console.error("No storageId in response:", responseData);
        throw new Error("No storageId returned from upload");
      }

      // Update user avatar in database
      await updateAvatar({
        clerkId: user.id,
        storageId,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload image. Please try again.");
    }
    setIsUploadingAvatar(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orbit-blue flex items-center justify-center text-white hover:bg-orbit-blue/80 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-900">{userData?.name}</p>
            <p className="text-sm text-gray-500">@{userData?.username}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.displayName")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.displayName")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.status")}
            </label>
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder={t("profile.statusPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.bio")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.bioPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orbit-blue/50 resize-none"
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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
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
                  : "border-gray-200 hover:border-gray-300 bg-gray-50"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-gray-900">{lang.name}</span>
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

interface PrivacySettingsProps {
  userData: {
    settings: {
      showOnlineStatus?: boolean;
      readReceipts?: boolean;
      typingIndicators?: boolean;
    };
  } | null | undefined;
  userId: string;
  t: ReturnType<typeof useTranslations>;
}

function PrivacySettings({ userData, userId, t }: PrivacySettingsProps) {
  const [showOnlineStatus, setShowOnlineStatus] = useState(
    userData?.settings?.showOnlineStatus ?? true
  );
  const [readReceipts, setReadReceipts] = useState(
    userData?.settings?.readReceipts ?? true
  );
  const [typingIndicators, setTypingIndicators] = useState(
    userData?.settings?.typingIndicators ?? true
  );
  const [savingField, setSavingField] = useState<string | null>(null);

  const updateSettings = useMutation(api.users.updateSettings);

  const handleToggle = async (
    field: "showOnlineStatus" | "readReceipts" | "typingIndicators",
    value: boolean
  ) => {
    // Update local state immediately
    if (field === "showOnlineStatus") setShowOnlineStatus(value);
    if (field === "readReceipts") setReadReceipts(value);
    if (field === "typingIndicators") setTypingIndicators(value);

    setSavingField(field);
    try {
      await updateSettings({
        clerkId: userId,
        settings: { [field]: value },
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Revert on error
      if (field === "showOnlineStatus") setShowOnlineStatus(!value);
      if (field === "readReceipts") setReadReceipts(!value);
      if (field === "typingIndicators") setTypingIndicators(!value);
    }
    setSavingField(null);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("settings.privacy")}
        </h2>

        <div className="space-y-4">
          <ToggleSetting
            label={t("settings.showOnlineStatus")}
            description="Let others see when you're online"
            enabled={showOnlineStatus}
            onToggle={(value) => handleToggle("showOnlineStatus", value)}
            loading={savingField === "showOnlineStatus"}
          />

          <ToggleSetting
            label={t("settings.readReceipts")}
            description="Show when you've read messages"
            enabled={readReceipts}
            onToggle={(value) => handleToggle("readReceipts", value)}
            loading={savingField === "readReceipts"}
          />

          <ToggleSetting
            label={t("settings.typingIndicators")}
            description="Show when you're typing a message"
            enabled={typingIndicators}
            onToggle={(value) => handleToggle("typingIndicators", value)}
            loading={savingField === "typingIndicators"}
          />
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-red-500 font-medium mb-2">
            {t("settings.deleteAccount")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("settings.deleteAccountWarning")}
          </p>
          <Button variant="secondary" className="text-red-500 border-red-300 hover:bg-red-50">
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
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-orbit-blue" : "bg-gray-300"
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
