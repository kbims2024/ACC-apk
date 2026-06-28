import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../lib/store";
import {
  Shield,
  Ban,
  CheckCircle,
  Search,
  User,
  FileCheck,
  XCircle,
  X,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Heart,
  Trash2,
  Copy,
  Check,
  Share2,
  Sparkles,
  Loader2,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import EmojiPicker from "emoji-picker-react";
import { COUNTRIES, LOCAL_PAYMENT_METHODS_BY_COUNTRY } from "../lib/constants";

export default function Admin() {
  const { user, token, login } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "settings">(
    "stats",
  );
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [copied, setCopied] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<"acc" | "affiliate">("acc");
  const [transferAmount, setTransferAmount] = useState<number | "">("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferHistoryModal, setShowTransferHistoryModal] =
    useState(false);
  const [historyType, setHistoryType] = useState<string>("wallet");
  const [historyFilterType, setHistoryFilterType] = useState<
    "all" | "commission" | "withdrawal"
  >("all");
  const [historySortOrder, setHistorySortOrder] = useState<"desc" | "asc">(
    "desc",
  );
  const [historyCountryFilter, setHistoryCountryFilter] = useState("all");
  const [historyPlanFilter, setHistoryPlanFilter] = useState("all");
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [userSortField, setUserSortField] = useState<string>("createdAt");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawSource, setWithdrawSource] = useState<"acc" | "affiliate">(
    "acc",
  );
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetFinances, setResetFinances] = useState(false);
  const [resetTenders, setResetTenders] = useState(false);
  const [resetRequests, setResetRequests] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [settings, setSettings] = useState({
    platformName: "ArtisanChapChap",
    logoUrl: "",
    flashInfoEnabled: false,
    flashInfoBgColor: "#E11D48",
    flashInfos: [] as { text: string; priority: number }[],
    timerEnabled: false,
    timerBgColor: "#BE123C",
    timerEndDate: "",
    timerTitle: "Expire dans :",
    savedColors: [] as string[],
    subscriptionPrices: {
      workerQuarterly: 5000,
      workerSemiannual: 8000,
      workerYearly: 14000,
    },
    contentPages: {
      about:
        "<h1>À propos de nous</h1><p>Contenu à modifier par l'administrateur...</p>",
      terms:
        "<h1>Conditions d'utilisation</h1><p>Contenu à modifier par l'administrateur...</p>",
      privacy:
        "<h1>Politique de confidentialité</h1><p>Contenu à modifier par l'administrateur...</p>",
      faq: "<h1>Aide & FAQ</h1><p>Contenu à modifier par l'administrateur...</p>",
    },
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      let query = "";
      if (dateRange.start) query += `startDate=${dateRange.start}&`;
      if (dateRange.end) query += `endDate=${dateRange.end}`;

      const res = await fetch(`/api/admin/stats?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          platformName: data.platformName || "",
          logoUrl: data.logoUrl || "",
          flashInfoEnabled: data.flashInfoEnabled || false,
          flashInfoBgColor: data.flashInfoBgColor || "#E11D48",
          flashInfos: data.flashInfos || [],
          timerEnabled: data.timerEnabled || false,
          timerBgColor: data.timerBgColor || "#BE123C",
          timerEndDate: data.timerEndDate
            ? new Date(data.timerEndDate).toISOString().slice(0, 16)
            : "",
          timerTitle: data.timerTitle || "Expire dans :",
          savedColors: data.savedColors || [],
          subscriptionPrices: data.subscriptionPrices || {
            workerQuarterly: 5000,
            workerSemiannual: 8000,
            workerYearly: 14000,
          },
          contentPages: data.contentPages || {
            about:
              "<h1>À propos de nous</h1><p>Contenu à modifier par l'administrateur...</p>",
            terms:
              "<h1>Conditions d'utilisation</h1><p>Contenu à modifier par l'administrateur...</p>",
            privacy:
              "<h1>Politique de confidentialité</h1><p>Contenu à modifier par l'administrateur...</p>",
            faq: "<h1>Aide & FAQ</h1><p>Contenu à modifier par l'administrateur...</p>",
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePage = async (
    page: "about" | "terms" | "privacy" | "faq",
  ) => {
    setGeneratingField(page);
    try {
      const res = await fetch("/api/ai/generate-page-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ page }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setSettings({
          ...settings,
          contentPages: {
            ...settings.contentPages,
            [page]: data.text,
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetFinances && !resetTenders && !resetRequests) {
      toast.error("Veuillez sélectionner au moins un élément à réinitialiser.");
      return;
    }

    if (
      !window.confirm(
        "⚠️ ATTENTION : Êtes-vous sûr de vouloir réinitialiser les données sélectionnées ?\nCette action est MAJEURE, DÉFINITIVE et IRRÉVERSIBLE.",
      )
    )
      return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/reset-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resetFinances, resetTenders, resetRequests }),
      });
      if (res.ok) {
        toast.success(
          "Succès : Les données sélectionnées ont été réinitialisées.",
        );
        setShowResetModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la réinitialisation");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau");
    } finally {
      setIsResetting(false);
    }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Paramètres mis à jour !");
        window.location.reload(); // Quick way to apply logo everywhere
      } else {
        toast.error("Erreur lors de la mise à jour des paramètres.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur serveur.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    if (
      !confirm(
        `Voulez-vous vraiment ${newStatus === "suspended" ? "suspendre" : "réactiver"} cet utilisateur ?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
        );
        fetchStats(); // Update stats in real-time
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur serveur");
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        `Voulez-vous vraiment supprimer cet utilisateur définitivement ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        fetchStats(); // Update stats in real-time
        toast.success("Utilisateur supprimé avec succès.");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur serveur");
    }
  };

  const handleKycAction = async (
    userId: string,
    action: "verified" | "rejected",
  ) => {
    if (
      !confirm(
        `Voulez-vous vraiment ${action === "verified" ? "approuver" : "rejeter"} le KYC de cet utilisateur ?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycStatus: action }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
        );
        fetchStats(); // Update stats in real-time
      } else {
        toast.error("Erreur lors de la mise à jour du KYC");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur serveur");
    }
  };

  const fetchTransferHistory = async (type: string = "wallet") => {
    setIsLoadingHistory(true);
    setHistoryType(type);
    setHistoryFilterType("all");
    setHistorySortOrder("desc");
    setHistoryCountryFilter("all");
    setHistoryPlanFilter("all");
    setShowTransferHistoryModal(true);
    try {
      const res = await fetch(`/api/admin/transfer-history?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransferHistory(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || transferAmount <= 0) {
      toast.error("Veuillez entrer un montant valide.");
      return;
    }
    setIsTransferring(true);
    try {
      const url =
        transferType === "acc"
          ? "/api/admin/transfer-acc-revenue"
          : "/api/users/transfer-affiliate";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: transferAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du transfert");
      }
      if (data.user) {
        login(data.user, token!); // update user in context
      }
      toast.success("Transfert réussi vers le portefeuille !");
      setShowTransferModal(false);
      setTransferAmount("");
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Veuillez entrer un montant valide.");
      return;
    }
    if (!withdrawMethod) {
      toast.error("Veuillez choisir une méthode.");
      return;
    }
    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawMethod,
          source: withdrawSource,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du retrait");
      }
      login(data.user, token!); // update user in context
      toast.success("Retrait effectué avec succès !");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawMethod("");
      fetchStats(); // Update stats in real-time
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-700">Accès Refusé</h2>
          <p className="text-slate-500">
            Vous n'avez pas les droits d'administration.
          </p>
        </div>
      </div>
    );
  }

  const toggleFavoriteColor = (color: string) => {
    setSettings((prev) => {
      const isFav = prev.savedColors.includes(color);
      if (isFav) {
        return {
          ...prev,
          savedColors: prev.savedColors.filter((c) => c !== color),
        };
      } else {
        return { ...prev, savedColors: [...prev.savedColors, color] };
      }
    });
  };

  const handleUserSort = (field: string) => {
    if (userSortField === field) {
      setUserSortOrder(userSortOrder === "asc" ? "desc" : "asc");
    } else {
      setUserSortField(field);
      setUserSortOrder("asc");
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let valA = a[userSortField] || "";
      let valB = b[userSortField] || "";
      if (userSortField === "role") {
        valA = a.role + (a.entityType || "");
        valB = b.role + (b.entityType || "");
      }
      if (userSortField === "name") {
        valA = a.name?.toLowerCase() || "";
        valB = b.name?.toLowerCase() || "";
      }
      
      if (valA < valB) return userSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return userSortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-l-4 border-rose-500 pl-4">
            Panel d'Administration
          </h1>
          <p className="text-slate-500 mt-1 ml-5">
            Gérez les comptes utilisateurs (suspension/réactivation)
          </p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom / email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none dark:text-blue-400"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${activeTab === "stats" ? "bg-rose-500 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
        >
          Statistiques
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${activeTab === "users" ? "bg-rose-500 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
        >
          Gestion Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${activeTab === "settings" ? "bg-rose-500 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
        >
          Paramètres Globaux
        </button>
      </div>

      {activeTab === "stats" && (
        <div className="space-y-8">
          {stats?.adminReferralCode && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1">
                  Votre Code de Parrainage (Admin)
                </h3>
                <p className="text-emerald-100 text-sm max-w-xl">
                  Les artisans qui s'inscrivent sans code utiliseront ce code
                  par défaut. Partagez-le pour gagner des commissions (25% en
                  niveau 1).
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3 bg-white/20 p-2 pr-4 rounded-xl backdrop-blur-md">
                <div className="bg-white text-emerald-700 font-mono font-bold px-4 py-2 rounded-lg text-lg tracking-wider">
                  {stats.adminReferralCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(stats.adminReferralCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-white hover:text-emerald-100 transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
                  title="Copier le code"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Code de parrainage Admin",
                          text: `Utilise le code ${stats.adminReferralCode} pour t'inscrire !`,
                        })
                        .catch(console.error);
                    } else {
                      navigator.clipboard.writeText(stats.adminReferralCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="text-white hover:text-emerald-100 transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
                  title="Partager le code"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4 relative z-10">
            <div className="text-slate-700 dark:text-slate-300 font-medium">
              Filtrer les revenus par date :
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
              <span className="text-slate-400">à</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
              <button
                onClick={() => setDateRange({ start: "", end: "" })}
                className="px-3 py-2 text-sm text-slate-500 hover:text-rose-500 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium mb-2">
                Total Clients
              </h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats ? stats.totalClients : "..."}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium mb-2">
                Total Artisans
              </h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats ? stats.totalArtisans : "..."}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium mb-2">
                Artisans Actifs / Inactifs
              </h3>
              <div className="flex gap-4">
                <p className="text-3xl font-bold text-emerald-600">
                  {stats ? stats.activeArtisans : "..."}
                </p>
                <p className="text-3xl font-bold text-rose-600 opacity-80">
                  {stats ? stats.inactiveArtisans : "..."}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-2">
                  Vos Filleuls N1 / N2 (Admin)
                </h3>
                <div className="flex gap-4">
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats ? stats.adminFilleulsN1 : "..."}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 opacity-80">
                    {stats ? stats.adminFilleulsN2 : "..."}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Total Filleuls pour la plateforme
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Finances Administrateur
            </h2>
            <p className="text-slate-500 text-sm">
              Gestion des revenus de la plateforme et de l'affiliation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 text-center">
                  Volume global des abonnements
                </span>
                <span className="text-4xl font-black text-blue-600 dark:text-blue-400 text-center">
                  {stats
                    ? (stats.totalRevenue || 0).toLocaleString("fr-FR")
                    : "..."}{" "}
                  <span className="text-sm">FCFA</span>
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => fetchTransferHistory("subscriptions_global")}
                  className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition"
                >
                  Historique Global
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 text-center">
                  Revenus ACC (65%)
                </span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 text-center">
                  {stats
                    ? (stats.accRevenue || 0).toLocaleString("fr-FR")
                    : "..."}{" "}
                  <span className="text-sm">FCFA</span>
                </span>

                <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-900/50">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">
                      Total retiré
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {stats
                        ? (stats.accTransferred || 0).toLocaleString("fr-FR")
                        : "..."}{" "}
                      FCFA
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">
                      Total restant
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {stats
                        ? (stats.accAvailable || 0).toLocaleString("fr-FR")
                        : "..."}{" "}
                      FCFA
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    if (!stats || (stats.accAvailable || 0) <= 0) {
                      toast.error("Solde insuffisant.");
                      return;
                    }
                    setWithdrawSource("acc");
                    setShowWithdrawModal(true);
                  }}
                  className="bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition flex-1"
                >
                  Retirer
                </button>
                <button
                  onClick={() => fetchTransferHistory("acc")}
                  className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition flex-1"
                >
                  Historique
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 text-center">
                  Revenus Affiliés (35%)
                </span>
                <span className="text-4xl font-black text-amber-600 dark:text-amber-400 text-center">
                  {stats
                    ? (stats.adminAffiliateRevenue || 0).toLocaleString("fr-FR")
                    : "..."}{" "}
                  <span className="text-sm">FCFA</span>
                </span>

                <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-900/50">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-500 uppercase tracking-widest">
                      Total retiré
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {stats
                        ? (stats.adminAffiliateTransferred || 0).toLocaleString(
                            "fr-FR",
                          )
                        : "..."}{" "}
                      FCFA
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-500 uppercase tracking-widest">
                      Total restant
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {stats
                        ? (stats.adminAffiliateAvailable || 0).toLocaleString(
                            "fr-FR",
                          )
                        : "..."}{" "}
                      FCFA
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => fetchTransferHistory("affiliate_all_platform")}
                  className="w-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition"
                >
                  Historique Global
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Affiliates */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Top 5 Affiliés (Parrains)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    Total Affiliés : {stats?.totalAffiliates || 0}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {stats?.topAffiliates?.length > 0 ? (
                  stats.topAffiliates.map((affiliate: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold relative">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {affiliate.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {affiliate.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {affiliate.filleulsCount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Filleuls</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">
                    Aucune donnée d'affiliation disponible
                  </p>
                )}
              </div>
            </div>

            {/* Top 5 Clients */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Top 5 Clients (les plus actifs)
              </h3>
              <div className="space-y-4">
                {stats?.topClients?.length > 0 ? (
                  stats.topClients.map((client: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {client.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {client.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {client.requestCount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Requêtes</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            {/* Top 5 Artisans */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Top 5 Artisans (mieux notés et actifs)
              </h3>
              <div className="space-y-4">
                {stats?.topArtisans?.length > 0 ? (
                  stats.topArtisans.map((artisan: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {artisan.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {artisan.profession}
                            {artisan.subscription?.plan && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                Plan:{" "}
                                {artisan.subscription.plan === "yearly"
                                  ? "Annuel"
                                  : artisan.subscription.plan === "quarterly"
                                    ? "Trimestriel"
                                    : "Mensuel"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                          {artisan.rating || 0}{" "}
                          <span className="text-yellow-400">★</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {artisan.reviewsCount || 0} avis
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-8 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Paramètres Globaux
          </h2>
          <form onSubmit={updateSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de la plateforme
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) =>
                  setSettings({ ...settings, platformName: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                placeholder="Ex: ArtisanChapChap"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Logo de la plateforme
              </label>
              <div className="flex items-center gap-4">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded-xl bg-slate-50 border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                    Aucun logo
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(
                            "La taille de l'image ne doit pas dépasser 5MB",
                          );
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings({
                            ...settings,
                            logoUrl: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-colors cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: "" })}
                    className="text-xs text-rose-500 mt-2 hover:underline inline-block"
                  >
                    Retirer le logo (utiliser l'icône par défaut)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Bande Défilante (Flash Info)
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.flashInfoEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        flashInfoEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-slate-700">
                    Activer la bande défilante
                  </span>
                </label>

                {settings.flashInfoEnabled && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Couleur de fond (Flash Infos)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.flashInfoBgColor}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              flashInfoBgColor: e.target.value,
                            })
                          }
                          className="w-16 h-10 p-1 bg-white border border-slate-200 dark:border-slate-700 rounded cursor-pointer shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            toggleFavoriteColor(settings.flashInfoBgColor)
                          }
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          title={
                            settings.savedColors?.includes(
                              settings.flashInfoBgColor,
                            )
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                        >
                          <Heart
                            className={`w-5 h-5 ${settings.savedColors?.includes(settings.flashInfoBgColor) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                          />
                        </button>
                      </div>
                      {(settings.savedColors || []).length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="text-xs text-slate-500 mr-1">
                            Favoris :
                          </span>
                          {(settings.savedColors || []).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setSettings({
                                  ...settings,
                                  flashInfoBgColor: color,
                                })
                              }
                              className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 shadow-sm transition transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              title={`Choisir ${color}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                      Messages de la bande
                    </label>
                    {settings.flashInfos.map((info, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === 0) return;
                              const newInfos = [...settings.flashInfos];
                              const temp = newInfos[idx];
                              newInfos[idx] = newInfos[idx - 1];
                              newInfos[idx - 1] = temp;
                              newInfos.forEach(
                                (inf, i) =>
                                  (inf.priority = newInfos.length - i),
                              );
                              setSettings({
                                ...settings,
                                flashInfos: newInfos,
                              });
                            }}
                            className={`p-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 transition-colors ${idx === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                            disabled={idx === 0}
                            title="Monter"
                          >
                            <ArrowUp className="w-4 h-4 text-slate-600 dark:text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === settings.flashInfos.length - 1)
                                return;
                              const newInfos = [...settings.flashInfos];
                              const temp = newInfos[idx];
                              newInfos[idx] = newInfos[idx + 1];
                              newInfos[idx + 1] = temp;
                              newInfos.forEach(
                                (inf, i) =>
                                  (inf.priority = newInfos.length - i),
                              );
                              setSettings({
                                ...settings,
                                flashInfos: newInfos,
                              });
                            }}
                            className={`p-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 transition-colors ${idx === settings.flashInfos.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                            disabled={idx === settings.flashInfos.length - 1}
                            title="Descendre"
                          >
                            <ArrowDown className="w-4 h-4 text-slate-600 dark:text-blue-400" />
                          </button>
                        </div>
                        <div className="relative flex-1 flex">
                          <input
                            type="text"
                            value={info.text}
                            onChange={(e) => {
                              const newInfos = [...settings.flashInfos];
                              newInfos[idx].text = e.target.value;
                              setSettings({
                                ...settings,
                                flashInfos: newInfos,
                              });
                            }}
                            className="flex-1 px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                            placeholder="Message"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setOpenEmojiPickerIndex(
                                openEmojiPickerIndex === idx ? null : idx,
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          {openEmojiPickerIndex === idx && (
                            <div className="absolute top-full mt-2 right-0 z-50">
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenEmojiPickerIndex(null)}
                              />
                              <div className="relative z-50 shadow-2xl rounded-2xl overflow-hidden">
                                <EmojiPicker
                                  onEmojiClick={(emojiData) => {
                                    const newInfos = [...settings.flashInfos];
                                    newInfos[idx].text =
                                      newInfos[idx].text + emojiData.emoji;
                                    setSettings({
                                      ...settings,
                                      flashInfos: newInfos,
                                    });
                                    setOpenEmojiPickerIndex(null);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newInfos = settings.flashInfos.filter(
                              (_, i) => i !== idx,
                            );
                            setSettings({ ...settings, flashInfos: newInfos });
                          }}
                          className="px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newInfos = [
                          ...settings.flashInfos,
                          { text: "", priority: 0 },
                        ];
                        newInfos.forEach(
                          (inf, i) => (inf.priority = newInfos.length - i),
                        );
                        setSettings({ ...settings, flashInfos: newInfos });
                      }}
                      className="text-sm text-brand-600 hover:underline font-medium"
                    >
                      + Ajouter une info
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8">
                Bande de Compte à rebours
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.timerEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        timerEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-slate-700">
                    Activer le compte à rebours
                  </span>
                </label>

                {settings.timerEnabled && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Couleur de fond (Compte à rebours)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.timerBgColor}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              timerBgColor: e.target.value,
                            })
                          }
                          className="w-16 h-10 p-1 bg-white border border-slate-200 dark:border-slate-700 rounded cursor-pointer shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            toggleFavoriteColor(settings.timerBgColor)
                          }
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          title={
                            settings.savedColors?.includes(
                              settings.timerBgColor,
                            )
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                        >
                          <Heart
                            className={`w-5 h-5 ${settings.savedColors?.includes(settings.timerBgColor) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                          />
                        </button>
                      </div>
                      {(settings.savedColors || []).length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="text-xs text-slate-500 mr-1">
                            Favoris :
                          </span>
                          {(settings.savedColors || []).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setSettings({
                                  ...settings,
                                  timerBgColor: color,
                                })
                              }
                              className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 shadow-sm transition transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              title={`Choisir ${color}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Titre du compte à rebours
                      </label>
                      <input
                        type="text"
                        value={settings.timerTitle}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            timerTitle: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                        placeholder="Ex: Expire dans :"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.timerEndDate}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            timerEndDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Tarifs des Abonnements (FCFA)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trimestriel (Base)
                  </label>
                  <input
                    type="number"
                    value={settings.subscriptionPrices.workerQuarterly}
                    onChange={(e) => {
                      const qPrice = parseInt(e.target.value) || 0;
                      const semiDiscount =
                        settings.subscriptionPrices.workerSemiannual === 0
                          ? 0
                          : 1 -
                            settings.subscriptionPrices.workerSemiannual /
                              (settings.subscriptionPrices.workerQuarterly * 2);
                      const yearDiscount =
                        settings.subscriptionPrices.workerYearly === 0
                          ? 0
                          : 1 -
                            settings.subscriptionPrices.workerYearly /
                              (settings.subscriptionPrices.workerQuarterly * 4);

                      setSettings({
                        ...settings,
                        subscriptionPrices: {
                          ...settings.subscriptionPrices,
                          workerQuarterly: qPrice,
                          workerSemiannual:
                            qPrice * 2 > 0
                              ? Math.round(qPrice * 2 * (1 - semiDiscount))
                              : 0,
                          workerYearly:
                            qPrice * 4 > 0
                              ? Math.round(qPrice * 4 * (1 - yearDiscount))
                              : 0,
                        },
                      });
                    }}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Semestriel (-
                    {settings.subscriptionPrices.workerQuarterly > 0
                      ? Math.round(
                          (1 -
                            settings.subscriptionPrices.workerSemiannual /
                              (settings.subscriptionPrices.workerQuarterly *
                                2)) *
                            100,
                        )
                      : 0}
                    %)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Montant FCFA"
                      value={settings.subscriptionPrices.workerSemiannual}
                      onChange={(e) => {
                        const amount = parseInt(e.target.value) || 0;
                        setSettings({
                          ...settings,
                          subscriptionPrices: {
                            ...settings.subscriptionPrices,
                            workerSemiannual: amount,
                          },
                        });
                      }}
                      className="w-2/3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                      required
                    />
                    <input
                      type="number"
                      placeholder="%"
                      value={
                        settings.subscriptionPrices.workerQuarterly > 0
                          ? Math.round(
                              (1 -
                                settings.subscriptionPrices.workerSemiannual /
                                  (settings.subscriptionPrices.workerQuarterly *
                                    2)) *
                                100,
                            )
                          : 0
                      }
                      onChange={(e) => {
                        const pct = parseInt(e.target.value) || 0;
                        const newAmount = Math.round(
                          settings.subscriptionPrices.workerQuarterly *
                            2 *
                            (1 - pct / 100),
                        );
                        setSettings({
                          ...settings,
                          subscriptionPrices: {
                            ...settings.subscriptionPrices,
                            workerSemiannual: newAmount,
                          },
                        });
                      }}
                      className="w-1/3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Annuel (-
                    {settings.subscriptionPrices.workerQuarterly > 0
                      ? Math.round(
                          (1 -
                            settings.subscriptionPrices.workerYearly /
                              (settings.subscriptionPrices.workerQuarterly *
                                4)) *
                            100,
                        )
                      : 0}
                    %)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Montant FCFA"
                      value={settings.subscriptionPrices.workerYearly}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          subscriptionPrices: {
                            ...settings.subscriptionPrices,
                            workerYearly: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-2/3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                      required
                    />
                    <input
                      type="number"
                      placeholder="%"
                      value={
                        settings.subscriptionPrices.workerQuarterly > 0
                          ? Math.round(
                              (1 -
                                settings.subscriptionPrices.workerYearly /
                                  (settings.subscriptionPrices.workerQuarterly *
                                    4)) *
                                100,
                            )
                          : 0
                      }
                      onChange={(e) => {
                        const pct = parseInt(e.target.value) || 0;
                        const newAmount = Math.round(
                          settings.subscriptionPrices.workerQuarterly *
                            4 *
                            (1 - pct / 100),
                        );
                        setSettings({
                          ...settings,
                          subscriptionPrices: {
                            ...settings.subscriptionPrices,
                            workerYearly: newAmount,
                          },
                        });
                      }}
                      className="w-1/3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Contenus des Pages Légales (HTML autorisé)
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      À propos de nous
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePage("about")}
                      disabled={generatingField === "about"}
                      className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1 rounded-full flex items-center font-medium transition"
                    >
                      {generatingField === "about" ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Générer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={settings.contentPages.about}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contentPages: {
                          ...settings.contentPages,
                          about: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400 font-mono text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Conditions d'utilisation
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePage("terms")}
                      disabled={generatingField === "terms"}
                      className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1 rounded-full flex items-center font-medium transition"
                    >
                      {generatingField === "terms" ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Générer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={settings.contentPages.terms}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contentPages: {
                          ...settings.contentPages,
                          terms: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400 font-mono text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Politique de confidentialité
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePage("privacy")}
                      disabled={generatingField === "privacy"}
                      className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1 rounded-full flex items-center font-medium transition"
                    >
                      {generatingField === "privacy" ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Générer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={settings.contentPages.privacy}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contentPages: {
                          ...settings.contentPages,
                          privacy: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400 font-mono text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Aide & FAQ
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePage("faq")}
                      disabled={generatingField === "faq"}
                      className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1 rounded-full flex items-center font-medium transition"
                    >
                      {generatingField === "faq" ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Générer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={settings.contentPages.faq}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contentPages: {
                          ...settings.contentPages,
                          faq: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-inherit dark:text-blue-400 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Méthodes de Dépôt (Abonnements/Paiements) par Pays
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                "Carte Visa" et "Crypto (USDT)" seront toujours inclus.
              </p>
              <div className="space-y-4 mb-8">
                {(settings.depositMethodsByCountry || []).map(
                  (config: any, index: number) => {
                    const availableMethods = config.country
                      ? LOCAL_PAYMENT_METHODS_BY_COUNTRY[config.country] || []
                      : [];
                    return (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <select
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-900 font-medium"
                            value={config.country}
                            onChange={(e) => {
                              const newConfig = [
                                ...(settings.depositMethodsByCountry || []),
                              ];
                              // Change of country resets methods or we can keep them. Usually better to reset if completely different, or keep to avoid data loss.
                              newConfig[index].country = e.target.value;
                              setSettings({
                                ...settings,
                                depositMethodsByCountry: newConfig,
                              });
                            }}
                          >
                            <option value="">Sélectionner un pays</option>
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newConfig = [
                                ...(settings.depositMethodsByCountry || []),
                              ];
                              newConfig.splice(index, 1);
                              setSettings({
                                ...settings,
                                depositMethodsByCountry: newConfig,
                              });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {config.country ? (
                          <div className="flex flex-wrap gap-2">
                            {availableMethods.length > 0 ? (
                              availableMethods.map((method: string) => {
                                const isSelected = (
                                  config.methods || []
                                ).includes(method);
                                return (
                                  <button
                                    key={method}
                                    type="button"
                                    onClick={() => {
                                      const newConfig = [
                                        ...(settings.depositMethodsByCountry ||
                                          []),
                                      ];
                                      let methods =
                                        newConfig[index].methods || [];
                                      if (isSelected) {
                                        methods = methods.filter(
                                          (m: string) => m !== method,
                                        );
                                      } else {
                                        methods = [...methods, method];
                                      }
                                      newConfig[index].methods = methods;
                                      setSettings({
                                        ...settings,
                                        depositMethodsByCountry: newConfig,
                                      });
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700/50 dark:text-brand-300"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={14}
                                        className="inline mr-1"
                                      />
                                    )}
                                    {method}
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-sm text-slate-400 italic">
                                Aucune méthode locale prédéfinie pour ce pays,
                                ajoutez-les manuellement ci-dessous.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-brand-600 dark:text-brand-400">
                            Sélectionnez d'abord un pays pour voir les méthodes
                            de paiement locales disponibles.
                          </p>
                        )}
                        <input
                          type="text"
                          className="w-full mt-3 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-900"
                          placeholder="Autres méthodes (séparées par une virgule)"
                          value={(config.methods || [])
                            .filter(
                              (m: string) => !availableMethods.includes(m),
                            )
                            .join(", ")}
                          onChange={(e) => {
                            const rawCustom = e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s);
                            const standard = (config.methods || []).filter(
                              (m: string) => availableMethods.includes(m),
                            );
                            const newConfig = [
                              ...(settings.depositMethodsByCountry || []),
                            ];
                            newConfig[index].methods = [
                              ...standard,
                              ...rawCustom,
                            ];
                            setSettings({
                              ...settings,
                              depositMethodsByCountry: newConfig,
                            });
                          }}
                        />
                      </div>
                    );
                  },
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      depositMethodsByCountry: [
                        ...(settings.depositMethodsByCountry || []),
                        { country: "", methods: [] },
                      ],
                    });
                  }}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  + Ajouter une méthode de dépôt par pays
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Méthodes de Retrait par Pays
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                "Carte Visa" et "Crypto (USDT)" seront toujours inclus.
              </p>
              <div className="space-y-4">
                {(settings.withdrawMethodsByCountry || []).map(
                  (config: any, index: number) => {
                    const availableMethods = config.country
                      ? LOCAL_PAYMENT_METHODS_BY_COUNTRY[config.country] || []
                      : [];
                    return (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <select
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-900 font-medium"
                            value={config.country}
                            onChange={(e) => {
                              const newConfig = [
                                ...(settings.withdrawMethodsByCountry || []),
                              ];
                              newConfig[index].country = e.target.value;
                              setSettings({
                                ...settings,
                                withdrawMethodsByCountry: newConfig,
                              });
                            }}
                          >
                            <option value="">Sélectionner un pays</option>
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newConfig = [
                                ...(settings.withdrawMethodsByCountry || []),
                              ];
                              newConfig.splice(index, 1);
                              setSettings({
                                ...settings,
                                withdrawMethodsByCountry: newConfig,
                              });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {config.country ? (
                          <div className="flex flex-wrap gap-2">
                            {availableMethods.length > 0 ? (
                              availableMethods.map((method: string) => {
                                const isSelected = (
                                  config.methods || []
                                ).includes(method);
                                return (
                                  <button
                                    key={method}
                                    type="button"
                                    onClick={() => {
                                      const newConfig = [
                                        ...(settings.withdrawMethodsByCountry ||
                                          []),
                                      ];
                                      let methods =
                                        newConfig[index].methods || [];
                                      if (isSelected) {
                                        methods = methods.filter(
                                          (m: string) => m !== method,
                                        );
                                      } else {
                                        methods = [...methods, method];
                                      }
                                      newConfig[index].methods = methods;
                                      setSettings({
                                        ...settings,
                                        withdrawMethodsByCountry: newConfig,
                                      });
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700/50 dark:text-brand-300"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={14}
                                        className="inline mr-1"
                                      />
                                    )}
                                    {method}
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-sm text-slate-400 italic">
                                Aucune méthode locale prédéfinie pour ce pays,
                                ajoutez-les manuellement ci-dessous.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-brand-600 dark:text-brand-400">
                            Sélectionnez d'abord un pays pour voir les méthodes
                            de paiement locales disponibles.
                          </p>
                        )}
                        <input
                          type="text"
                          className="w-full mt-3 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-900"
                          placeholder="Autres méthodes (séparées par une virgule)"
                          value={(config.methods || [])
                            .filter(
                              (m: string) => !availableMethods.includes(m),
                            )
                            .join(", ")}
                          onChange={(e) => {
                            const rawCustom = e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s);
                            const standard = (config.methods || []).filter(
                              (m: string) => availableMethods.includes(m),
                            );
                            const newConfig = [
                              ...(settings.withdrawMethodsByCountry || []),
                            ];
                            newConfig[index].methods = [
                              ...standard,
                              ...rawCustom,
                            ];
                            setSettings({
                              ...settings,
                              withdrawMethodsByCountry: newConfig,
                            });
                          }}
                        />
                      </div>
                    );
                  },
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      withdrawMethodsByCountry: [
                        ...(settings.withdrawMethodsByCountry || []),
                        { country: "", methods: [] },
                      ],
                    });
                  }}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  + Ajouter une configuration par pays
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isSavingSettings
                ? "Enregistrement..."
                : "Sauvegarder les paramètres"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Zone Dangereuse (Tests Uniquement)
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Ce bouton permet de remettre le système à zéro. À utiliser
              uniquement pendant la phase de test. Il devra être supprimé en
              production.
            </p>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
              Mise à zéro du système
            </button>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th 
                      onClick={() => handleUserSort('name')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Utilisateur
                        {userSortField === 'name' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleUserSort('role')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Rôle / Type
                        {userSortField === 'role' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleUserSort('country')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Pays
                        {userSortField === 'country' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleUserSort('createdAt')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {userSortField === 'createdAt' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleUserSort('status')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Statut
                        {userSortField === 'status' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleUserSort('kycStatus')}
                      className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        KYC
                        {userSortField === 'kycStatus' && (userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            {u.photo ? (
                              <img
                                src={u.photo}
                                alt={u.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {u.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {u.email}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {u.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider">
                            {u.role}
                          </span>
                          {u.role === "worker" && (
                            <span className="text-xs text-brand-600 font-medium">
                              {u.profession}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {u.country || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {u.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium border border-rose-100">
                            <Ban className="w-4 h-4" /> Suspendu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                            <CheckCircle className="w-4 h-4" /> Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.kycStatus === "verified" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                            <CheckCircle className="w-4 h-4" /> Vérifié
                          </span>
                        )}
                        {u.kycStatus === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                            En attente
                          </span>
                        )}
                        {(u.kycStatus === "unverified" || !u.kycStatus) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200">
                            Non vérifié
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.kycStatus === "pending" && (
                          <div className="flex gap-2 justify-end mb-2">
                            <button
                              onClick={() => handleKycAction(u._id, "verified")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                            >
                              <FileCheck className="w-4 h-4" /> Approuver
                            </button>
                            <button
                              onClick={() => handleKycAction(u._id, "rejected")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition"
                            >
                              <XCircle className="w-4 h-4" /> Rejeter
                            </button>
                          </div>
                        )}
                        {u.role !== "admin" && ( // Don't allow admins to suspend other admins easily to prevent lockouts
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() =>
                                toggleStatus(u._id, u.status || "active")
                              }
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                u.status === "suspended"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              }`}
                            >
                              {u.status === "suspended" ? (
                                <>Réactiver</>
                              ) : (
                                <>Suspendre</>
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-red-600 text-white hover:bg-red-700 shadow-sm"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Aucun utilisateur trouvé.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowTransferModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Transférer Revenu{" "}
                {transferType === "acc" ? "ACC (65%)" : "d'Affiliation"}
              </h2>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) =>
                      setTransferAmount(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-lg"
                    placeholder="Ex: 50000"
                    min="1"
                    max={
                      transferType === "acc"
                        ? stats?.accAvailable || 0
                        : stats?.adminAffiliateAvailable || 0
                    }
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Disponible :{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {transferType === "acc"
                        ? (stats?.accAvailable || 0).toLocaleString("fr-FR")
                        : (stats?.adminAffiliateAvailable || 0).toLocaleString(
                            "fr-FR",
                          )}{" "}
                      FCFA
                    </span>
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                      isTransferring ||
                      !transferAmount ||
                      transferAmount >
                        (transferType === "acc"
                          ? stats?.accAvailable || 0
                          : stats?.adminAffiliateAvailable || 0)
                    }
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl font-bold flex items-center justify-center transition"
                  >
                    {isTransferring ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Confirmer le transfert"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer History Modal */}
      <AnimatePresence>
        {showTransferHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh]"
            >
              <button
                onClick={() => setShowTransferHistoryModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {historyType === "acc" && "Historique des Revenus ACC"}
                {historyType === "affiliate_all_platform" &&
                  "Historique Global d'Affiliation"}
                {historyType === "subscriptions_global" &&
                  "Volume Global des Abonnements"}
                {historyType === "transfer_acc" &&
                  "Historique des Transferts ACC"}
                {historyType === "transfer_affiliate" &&
                  "Historique des Transferts Affiliés"}
                {historyType === "wallet" && "Historique du Portefeuille"}
              </h2>

              {["affiliate_all_platform", "acc"].includes(historyType) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setHistoryFilterType("all")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${historyFilterType === "all" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Tout
                    </button>
                    <button
                      onClick={() => setHistoryFilterType("commission")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${historyFilterType === "commission" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      {historyType === "acc" ? "Revenus" : "Commissions"}
                    </button>
                    <button
                      onClick={() => setHistoryFilterType("withdrawal")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${historyFilterType === "withdrawal" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Retraits
                    </button>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setHistorySortOrder("desc")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${historySortOrder === "desc" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Récent
                    </button>
                    <button
                      onClick={() => setHistorySortOrder("asc")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${historySortOrder === "asc" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Ancien
                    </button>
                  </div>
                </div>
              )}

              {historyType === "subscriptions_global" && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <select
                    value={historyCountryFilter}
                    onChange={(e) => setHistoryCountryFilter(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">Tous les pays</option>
                    {[
                      ...new Set(
                        transferHistory
                          .map((tx) => tx.userId?.country)
                          .filter(Boolean),
                      ),
                    ].map((country) => (
                      <option key={country as string} value={country as string}>
                        {country as string}
                      </option>
                    ))}
                  </select>

                  <select
                    value={historyPlanFilter}
                    onChange={(e) => setHistoryPlanFilter(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">Tous les types</option>
                    {[
                      ...new Set(
                        transferHistory
                          .map(
                            (tx) =>
                              tx.description?.replace(/Abonnement /i, "") ||
                              "Classique",
                          )
                          .filter(Boolean),
                      ),
                    ].map((plan) => (
                      <option key={plan as string} value={plan as string}>
                        {plan as string}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 sm:col-span-1"></div>

                  <div className="flex bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1 shrink-0 col-span-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setHistorySortOrder("desc")}
                      className={`px-3 py-1.5 text-xs w-1/2 font-bold rounded-lg transition-colors ${historySortOrder === "desc" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Récent
                    </button>
                    <button
                      onClick={() => setHistorySortOrder("asc")}
                      className={`px-3 py-1.5 text-xs w-1/2 font-bold rounded-lg transition-colors ${historySortOrder === "asc" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Ancien
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {isLoadingHistory ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  </div>
                ) : (
                  (() => {
                    const filtered = transferHistory
                      .filter((tx) => {
                        if (historyType === "subscriptions_global") {
                          if (
                            historyCountryFilter !== "all" &&
                            tx.userId?.country !== historyCountryFilter
                          )
                            return false;
                          const plan =
                            tx.description?.replace(/Abonnement /i, "") ||
                            "Classique";
                          if (
                            historyPlanFilter !== "all" &&
                            plan !== historyPlanFilter
                          )
                            return false;
                          return true;
                        }
                        if (historyType === "acc") {
                          if (historyFilterType === "all") return true;
                          if (
                            historyFilterType === "commission" &&
                            tx.type === "subscription"
                          )
                            return true;
                          if (
                            historyFilterType === "withdrawal" &&
                            ["withdrawal", "transfer"].includes(tx.type)
                          )
                            return true;
                          return false;
                        }
                        if (historyType === "affiliate_all_platform") {
                          if (historyFilterType === "all") return true;
                          if (
                            tx.type === historyFilterType ||
                            (historyFilterType === "withdrawal" &&
                              tx.type === "transfer")
                          )
                            return true;
                          return false;
                        }
                        return true;
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.date || a.createdAt).getTime();
                        const dateB = new Date(b.date || b.createdAt).getTime();
                        return historySortOrder === "desc"
                          ? dateB - dateA
                          : dateA - dateB;
                      });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                          Aucun historique correspondant
                        </div>
                      );
                    }

                    return filtered.map((tx: any, idx: number) => {
                      let amount = tx.amount;
                      if (historyType === "acc" && tx.type === "subscription") {
                        amount = amount * 0.65;
                      }
                      return (
                        <div
                          key={idx}
                          className={`flex justify-between items-center p-4 rounded-xl border ${["withdrawal", "transfer"].includes(tx.type) ? "bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700"}`}
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">
                              {tx.description ||
                                (tx.type === "commission"
                                  ? "Commission"
                                  : tx.type === "withdrawal"
                                    ? "Retrait"
                                    : "Transfert")}
                            </div>
                            {tx.userId?.name && (
                              <div className="text-sm font-semibold text-brand-600 mt-0.5">
                                {tx.userId.name}{" "}
                                {historyType === "subscriptions_global" &&
                                  tx.userId.country && (
                                    <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 px-1.5 py-0.5 rounded text-[10px] ml-1 uppercase">
                                      {tx.userId.country}
                                    </span>
                                  )}{" "}
                                <span className="text-xs text-slate-400 font-normal ml-1">
                                  ({tx.userId.email})
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(tx.date || tx.createdAt).toLocaleString(
                                "fr-FR",
                              )}
                            </div>
                          </div>
                          <div
                            className={`font-black text-lg ${["withdrawal", "transfer"].includes(tx.type) ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {["withdrawal", "transfer"].includes(tx.type)
                              ? "-"
                              : "+"}
                            {amount.toLocaleString("fr-FR")}{" "}
                            <span className="text-sm font-medium">FCFA</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Retrait{" "}
                {withdrawSource === "acc"
                  ? "Revenus ACC (65%)"
                  : "Revenus d'Affiliation"}
              </h2>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) =>
                      setWithdrawAmount(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-lg"
                    placeholder="Min. 1000"
                    min="1000"
                    max={
                      withdrawSource === "acc"
                        ? stats?.accAvailable || 0
                        : stats?.adminAffiliateAvailable || 0
                    }
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Solde disponible :{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {withdrawSource === "acc"
                        ? (stats?.accAvailable || 0).toLocaleString("fr-FR")
                        : (stats?.adminAffiliateAvailable || 0).toLocaleString(
                            "fr-FR",
                          )}{" "}
                      FCFA
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Moyen de retrait
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="" disabled>
                      Sélectionner une méthode
                    </option>
                    <option value="Carte Visa">Carte Visa</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Crypto (USDT)">Crypto (USDT)</option>
                    <option value="Mobile Money (Orange)">
                      Mobile Money (Orange)
                    </option>
                    <option value="Mobile Money (MTN)">
                      Mobile Money (MTN)
                    </option>
                    <option value="Wave">Wave</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Virement Bancaire">
                      Virement Bancaire (Délai plus long)
                    </option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                      isWithdrawing || !withdrawAmount || !withdrawMethod
                    }
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl font-bold flex items-center justify-center transition"
                  >
                    {isWithdrawing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Confirmer le retrait"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal Réinitialisation */}
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Mise à zéro du système
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Sélectionnez les éléments que vous souhaitez réinitialiser.
                Cette action est irréversible.
              </p>

              <form onSubmit={handleResetData} className="space-y-4">
                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={resetFinances}
                    onChange={(e) => setResetFinances(e.target.checked)}
                    className="mt-1 shrink-0 text-brand-600 rounded border-slate-300 focus:ring-brand-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Finances & Abonnements
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Soldes portefeuilles, transactions, historiques de
                      revenus.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={resetTenders}
                    onChange={(e) => setResetTenders(e.target.checked)}
                    className="mt-1 shrink-0 text-brand-600 rounded border-slate-300 focus:ring-brand-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Demandes de devis
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Toutes les demandes de devis et les devis associés.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={resetRequests}
                    onChange={(e) => setResetRequests(e.target.checked)}
                    className="mt-1 shrink-0 text-brand-600 rounded border-slate-300 focus:ring-brand-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Requêtes & Messages
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Commandes directes, discussions, et messageries liées.
                    </div>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={
                    isResetting ||
                    (!resetFinances && !resetTenders && !resetRequests)
                  }
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
                >
                  {isResetting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirmer la réinitialisation"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
