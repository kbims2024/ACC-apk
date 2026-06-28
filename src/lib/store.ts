import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "worker" | "client" | "admin";
  profession?: string;
  photo?: string;
  phone?: string;
  whatsappPhone?: string;
  companyName?: string;
  country?: string;
  location?: string;
  shortDescription?: string;
  videoUrl?: string;
  description?: string;
  acceptedSettingsVersion?: number;
  rating?: number;
  hourlyRate?: string | number;
  kycStatus?: "pending" | "verified" | "rejected" | "none";
  fingerprintEnabled?: boolean;
  portfolio?: string[];
  availWeekdays?: string;
  availSaturday?: string;
  availSunday?: string;
  referralCode?: string;
  walletBalance?: number;
  referralStats?: {
    l1Count: number;
    l2Count: number;
    l3Count: number;
    l1Revenue: number;
    l2Revenue: number;
    l3Revenue: number;
    totalRevenue: number;
    transferredRevenue?: number;
  };
  subscription?: { activeUntil?: string };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  setUser: (user) => set({ user }),
}));

export type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const initialTheme = (localStorage.getItem("theme") as Theme) || "dark";
if (initialTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      if (newTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { theme: newTheme };
    });
  },
}));

interface GlobalSettings {
  logoUrl?: string;
  platformName: string;
  flashInfoEnabled?: boolean;
  flashInfoBgColor?: string;
  flashInfos?: { text: string; priority: number }[];
  timerEnabled?: boolean;
  timerBgColor?: string;
  timerEndDate?: string;
  timerTitle?: string;
  savedColors?: string[];
  subscriptionPrices?: {
    workerQuarterly: number;
    workerSemiannual: number;
    workerYearly: number;
  };
  contentPages?: {
    about: string;
    terms: string;
    privacy: string;
    faq: string;
  };
  withdrawMethodsByCountry?: {
    country: string;
    methods: string[];
  }[];
  depositMethodsByCountry?: {
    country: string;
    methods: string[];
  }[];
}

interface SettingsStore {
  settings: GlobalSettings | null;
  setSettings: (settings: GlobalSettings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings })
}));
