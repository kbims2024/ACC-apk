import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore, useSettingsStore } from "../lib/store";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  User,
  Loader2,
  Search,
  MapPin,
  ChevronRight,
  MessageSquare,
  Clock,
  PlusCircle,
  PenTool,
  CheckCircle2,
  Shield,
  Settings,
  LogOut,
  Phone,
  Mail,
  FileText,
  Download,
  Check,
  CheckCheck,
  Link,
  ArrowRight,
  Wallet,
  Banknote,
  HelpCircle,
  Briefcase,
  Activity,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Star,
  X,
  Eye,
  EyeOff,
  LayoutDashboard,
  Send,
  Paperclip,
  AlertCircle,
  Square,
  Trash2,
  Mic,
  Handshake,
  Info,
  ShieldCheck,
  Edit3,
  Package,
  Camera,
  Fingerprint,
  Gift,
  Copy,
  Bell,
  Save,
  Wand2,
  CheckCircle,
  XCircle,
  ChevronDown,
  Ban,
  Lock,
  Unlock,
  BarChart,
  UserPlus,
} from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import { io, Socket } from "socket.io-client";

import imageCompression from "browser-image-compression";
import {
  PHONE_PREFIXES,
  parsePhone,
  COUNTRIES,
  COUNTRY_FLAGS,
  CITIES_BY_COUNTRY,
  COMMON_PROFESSIONS,
  PAYMENT_LOGOS,
} from "../lib/constants";
const LOCAL_PAYMENT_METHODS_BY_COUNTRY: Record<string, string[]> = {
  Togo: ["Tmoney", "Flooz"],
  Bénin: ["MTN Mobile Money", "Moov Money"],
  Sénégal: ["Orange Money", "Wave", "Free Money"],
  "Côte d'Ivoire": ["Orange Money", "MTN Mobile Money", "Moov Money", "Wave"],
  "Burkina Faso": ["Orange Money", "Moov Money"],
  Mali: ["Orange Money", "Moov Money"],
  Niger: ["Airtel Money", "Moov Money"],
  Guinée: ["Orange Money", "MTN Mobile Money"],
  Cameroun: ["Orange Money", "MTN Mobile Money"],
  Gabon: ["Airtel Money", "Moov Money"],
  Congo: ["Airtel Money", "MTN Mobile Money"],
  "République Démocratique du Congo": [
    "Airtel Money",
    "Orange Money",
    "M-Pesa",
    "Afrimoney",
  ],
};

export default function Dashboard() {
  const { user, token, setUser, login, logout } = useAuthStore();
  const { settings } = useSettingsStore();

  const computedWalletBalance =
    (user?.referralStats?.totalRevenue || 0) -
    (user?.referralStats?.transferredRevenue || 0);

  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isKycLoading, setIsKycLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("requests");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [showPlanBenefitsModal, setShowPlanBenefitsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositPlanId, setDepositPlanId] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  const [showSubscriptionIntercept, setShowSubscriptionIntercept] =
    useState(false);
  const [subscriptionInterceptMsg, setSubscriptionInterceptMsg] =
    useState<React.ReactNode>("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [offerConfirmRequest, setOfferConfirmRequest] = useState<any>(null);
  const [showOfferSuccessModal, setShowOfferSuccessModal] = useState(false);
  const [isProcessingOffer, setIsProcessingOffer] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const [myTenders, setMyTenders] = useState<any[]>([]);
  const [clientRequestFilter, setClientRequestFilter] = useState("all");
  const [workerRequestFilter, setWorkerRequestFilter] = useState("none");
  const [clientRequestSort, setClientRequestSort] = useState("date-desc");
  const [requestSearch, setRequestSearch] = useState("");
  const [statsListModalData, setStatsListModalData] = useState<{ title: string; requests: any[] } | null>(null);
  const [hasAltAccount, setHasAltAccount] = useState<boolean | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const fetchAltAccountStatus = async () => {
    try {
      const res = await fetch("/api/auth/alternative-account", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHasAltAccount(data.hasAlternativeAccount);
      }
    } catch(e) {}
  };

  const handleSwitchAccount = async () => {
    if (!user) return;
    setIsSwitching(true);
    try {
      const targetRole = user.role === 'client' ? 'worker' : 'client';
      const res = await fetch("/api/auth/switch-account", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user, data.token);
        toast.success("Changement de compte réussi !");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors du changement de compte.");
      }
    } catch(e) {
      toast.error("Erreur serveur.");
    } finally {
      setIsSwitching(false);
    }
  };

  const playBeep = () => {
    try {
      const audio = new Audio('/notif.mp3');
      audio.play().catch(() => {});
    } catch(e){}
  };

  const fetchMyTenders = async () => {
    try {
      const res = await fetch("/api/tenders/my-tenders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyTenders(await res.json());
      }
    } catch(e) {}
  };

  const [replyText, setReplyText] = useState("");
  const [replyAudioUrl, setReplyAudioUrl] = useState<string | null>(null);
  const [replyAudioData, setReplyAudioData] = useState<string | null>(null);
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState<string | null>(
    null,
  );
  const ProgressConfirm = () => null;
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [historyType, setHistoryType] = useState("all");
  const [historyFilterType, setHistoryFilterType] = useState("all");
  const [historySortOrder, setHistorySortOrder] = useState("desc");
  const [showTransferHistoryModal, setShowTransferHistoryModal] =
    useState(false);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [showPassword2FAChoiceModal, setShowPassword2FAChoiceModal] =
    useState(false);
  const [selected2FAMethod, setSelected2FAMethod] = useState("email");
  const [showPasswordOtpModal, setShowPasswordOtpModal] = useState(false);
  const [passwordOtpCode, setPasswordOtpCode] = useState("");
  const [aiConfirmType, setAiConfirmType] = useState(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [submitProfileProgress, setSubmitProfileProgress] = useState(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showDefaultPassword, setShowDefaultPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
  const [isGeneratingShortDesc, setIsGeneratingShortDesc] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showAITip, setShowAITip] = useState(true);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [cloudinaryProgress, setCloudinaryProgress] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const handleVerifyPasswordOtp = async () => {};
  const executeGenerateDescription = async (type: "short" | "full") => {
    setAiConfirmType(null);
    if (!editFormData.profession) {
      toast.error("Veuillez d'abord sélectionner ou saisir votre métier.");
      return;
    }

    if (type === "short") setIsGeneratingShortDesc(true);
    else setIsGeneratingDesc(true);

    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, occupation: editFormData.profession }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la génération");
      }

      const data = await res.json();

      if (type === "short") {
        setEditFormData({ ...editFormData, shortDescription: data.text });
      } else {
        setEditFormData({ ...editFormData, description: data.text });
      }
      toast.success("Description générée avec succès !");
    } catch (error: any) {
      toast.error(error.message || "Erreur de génération");
    } finally {
      if (type === "short") setIsGeneratingShortDesc(false);
      else setIsGeneratingDesc(false);
    }
  };
  const confirmGenerateDescription = (type) => setAiConfirmType(type);
  const handleTogglePasswordVisibility = () =>
    setShowDefaultPassword(!showDefaultPassword);
  const [isRecordingReply, setIsRecordingReply] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const replyMediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [deleteMenuOpen, setDeleteMenuOpen] = useState<{
    reqId: string;
    resId: string;
  } | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  const handleDeleteMessage = async (
    reqId: string,
    resId: string,
    forEveryone: boolean,
  ) => {
    setIsDeletingMessage(true);
    try {
      const res = await fetch(
        `/api/requests/${reqId}/responses/${resId}?forEveryone=${forEveryone}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Erreur");

      const updatedReq = await res.json();
      setRequests((currentReqs) =>
        currentReqs.map((r) => (r._id === updatedReq._id ? updatedReq : r)),
      );
      setSelectedRequest((prev: any) =>
        prev && prev._id === updatedReq._id ? updatedReq : prev,
      );

      setToastMessage(
        forEveryone
          ? "Message supprimé pour tous"
          : "Message supprimé pour vous",
      );
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      toast.error("Erreur lors de la suppression du message");
    } finally {
      setIsDeletingMessage(false);
      setDeleteMenuOpen(null);
    }
  };

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedRequest?.responses]);
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedRequest?.responses]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedRequest?.responses]);

  const replyAudioChunksRef = useRef<BlobPart[]>([]);
  const [subscriptionTimeRemaining, setSubscriptionTimeRemaining] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!user || user.role !== "worker" || !user.subscription?.activeUntil)
      return;

    const updateCountdown = () => {
      const activeUntil = new Date(user.subscription.activeUntil).getTime();
      const now = new Date().getTime();
      const distance = activeUntil - now;

      if (distance < 0) {
        setSubscriptionTimeRemaining("Expiré");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timeStr = "";
        if (days > 0) timeStr += `${days}j `;
        timeStr += `${hours}h ${minutes}m ${seconds}s`;
        setSubscriptionTimeRemaining(timeStr);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Check for Stripe checkout success
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast.success(
        "Votre paiement a été effectué avec succès ! Votre abonnement est maintenant actif.",
      );
      // Nettoyer l'URL
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (query.get("canceled")) {
      toast.success("Paiement annulé.");
      // Nettoyer l'URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(console.error);
    }

    // Parse les numéros existants
    const parsedPhone = parsePhone(user.phone);
    const parsedWhatsApp = parsePhone(user.whatsappPhone);

    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phonePrefix: parsedPhone.prefix,
      phoneNumber: parsedPhone.number,
      whatsappPrefix: parsedWhatsApp.prefix,
      whatsappNumber: parsedWhatsApp.number,
      companyName: user.companyName || "",
      profession: user.profession || "",
      country: user.country || "Côte d'Ivoire",
      location: user.location || "",
      shortDescription: user.shortDescription || "",
      videoUrl: user.videoUrl || "",
      description: user.description || "",
      hourlyRate: user.hourlyRate || "",
      photo: user.photo || "",
      portfolio: user.portfolio || [],
      availWeekdays: user.availWeekdays || "08:00 - 18:00",
      availSaturday: user.availSaturday || "09:00 - 14:00",
      availSunday: user.availSunday || "Fermé",
      sameAsPhone: true, // ou on peut comparer si les deux sont idéntiques, mais gardons simple
    });
    fetchRequests();
    fetchAltAccountStatus();
    if (user.role !== "worker") {
       fetchMyTenders();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.scrollTo === 'client-stats') {
      setTimeout(() => {
        document.getElementById('client-stats')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.state, loading]);

  useEffect(() => {
    if (!user?._id) return;

    // Socket Initialization
    socketRef.current = io({
      transports: ["polling", "websocket"],
    });

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join", user._id);
    });
    if (socketRef.current.connected) {
      socketRef.current.emit("join", user._id);
    }

    // Listeners
    socketRef.current.on("newRequest", (reqData) => {
      setRequests((prev) => [reqData, ...prev]);
      
      const searchParams = new URLSearchParams(window.location.search);
      const pendingChatId = searchParams.get('chat');
      if (pendingChatId && String(reqData._id) === String(pendingChatId)) {
        handleSelectRequest(reqData);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      toast.success("Nouvelle demande de devis reçue !");
      setToastMessage("Nouvelle demande de devis reçue !");
      setTimeout(() => setToastMessage(null), 5000);
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
        new Notification("AfriWork", { body: "Nouvelle demande de devis reçue !" });
      }
    });

    socketRef.current.on("requestUpdated", (reqData) => {
      setRequests((prev) => {
        const oldReq = prev.find((r) => r._id === reqData._id);
        const oldResponsesCount = oldReq?.responses?.length || 0;
        const newResponsesCount = reqData.responses?.length || 0;

        if (newResponsesCount > oldResponsesCount) {
          const lastResponse = reqData.responses[reqData.responses.length - 1];
          
          if (lastResponse.text === "[[SYS_OFFER_CONFIRMED]]" || lastResponse.text === "[[SYS_DIRECT_AGREEMENT_REACHED]]") {
            setShowOfferSuccessModal(true);
            toast.success("L'accord a été confirmé unaniment !");
            playBeep();
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
              new Notification("AfriWork", { body: "L'accord a été confirmé pour votre demande." });
            }
          } else if (lastResponse.text === "[[SYS_DIRECT_AGREEMENT_DECLINED]]" && lastResponse.senderId !== user?._id) {
            toast.error("L'accord n'est pas encore unanime, la discussion peut se poursuivre.");
            playBeep();
          } else if (lastResponse.senderId !== user?._id) {
            if (lastResponse.text === "[[SYS_OFFER_PROPOSAL]]") {
              setOfferConfirmRequest(reqData);
              playBeep();
            } else if (lastResponse.text === "[[SYS_OFFER_REFUSED]]") {
              toast.error("Votre offre a été refusée pour le moment.");
              playBeep();
            } else {
              toast.success("Nouveau message reçu !");
              setToastMessage("Nouveau message reçu !");
              setTimeout(() => setToastMessage(null), 5000);
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
                new Notification("AfriWork", { body: "Vous avez reçu un nouveau message." });
              }
            }
          }
        }
        
        if (oldReq?.firstAcceptorId !== reqData.firstAcceptorId && reqData.firstAcceptorId) {
           if (reqData.firstAcceptorId !== user?._id) {
             toast.success("Votre interlocuteur a accepté l'offre !");
             playBeep();
             if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
               new Notification("AfriWork", { body: "Votre interlocuteur a accepté l'offre." });
             }
           }
        }

        if (oldReq?.status !== reqData.status) {
           // Si le statut change
           if (reqData.status === 'accepted' && newResponsesCount === oldResponsesCount) {
              toast.success("Votre demande a été acceptée !");
           }
        }
        return prev.map((r) => (r._id === reqData._id ? reqData : r));
      });
      setSelectedRequest((prevSelected: any) =>
        prevSelected?._id === reqData._id ? reqData : prevSelected,
      );
    });

    socketRef.current.on("requestDeleted", (reqId) => {
      setRequests((prev) => prev.filter((r) => r._id !== reqId));
      setSelectedRequest((prevSelected: any) =>
        prevSelected?._id === reqId ? null : prevSelected,
      );
    });

    socketRef.current.on("userStatus", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socketRef.current.on("statusResult", (statusMap: Record<string, string>) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        Object.entries(statusMap).forEach(([userId, status]) => {
          if (status === "online") next.add(userId);
          else next.delete(userId);
        });
        return next;
        
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  const handleSelectRequest = async (req: any) => {
    const amIWorkerForThisReq = String(req.workerId?._id || req.workerId) === String(user?._id);
    if (user?.role === "worker" && !req.tenderId && amIWorkerForThisReq) {
      const activeUntil = user.subscription?.activeUntil
        ? new Date(user.subscription.activeUntil).getTime()
        : 0;
      const now = new Date().getTime();
      const isActive = activeUntil > now;
      if (!isActive) {
        const clients = new Set(
          requests.map(
            (r) => r.clientId?._id || r.clientId || r.guestContact || "Inconnu",
          ),
        );
        const clientCount = clients.size;
        const countToDisplay = clientCount > 0 ? clientCount : 1;
        const isExpired = !!user.subscription?.activeUntil;
        const formattedDate = isExpired
          ? new Date(user.subscription!.activeUntil!).toLocaleDateString()
          : "";
        const intro =
          countToDisplay <= 1
            ? "Nouveau client intéressé"
            : "Nouveaux clients intéressés";
        const msgA = `Vous avez été contacté par ${countToDisplay} client${countToDisplay > 1 ? "s" : ""}.`;
        const msgB = isExpired
          ? `Cependant, votre abonnement a expiré depuis le ${formattedDate}.`
          : "Cependant, vous n'avez pas encore souscrit à un abonnement.";
        const msgC =
          countToDisplay <= 1
            ? "Pour accéder à son message et répondre à sa demande, veuillez activer votre abonnement."
            : "Pour accéder à leurs messages et répondre à leurs demandes, veuillez activer votre abonnement.";

        setSubscriptionInterceptMsg(
          <div className="space-y-4 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="inline-block text-2xl origin-bottom"
              >
                🎉
              </motion.span>
              {intro} !
            </p>
            <p>{msgA}</p>
            <p>{msgB}</p>
            <p>{msgC}</p>
            <p className="font-semibold text-brand-700 dark:text-brand-400 mt-4 flex justify-center items-center gap-2 bg-brand-50 dark:bg-brand-900/30 py-3 rounded-lg border border-brand-100 dark:border-brand-800">
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="inline-block text-2xl"
              >
                🚀
              </motion.span>
              Les abonnements commencent à seulement 500 FCFA par trimestre.
            </p>
          </div>,
        );
        setShowSubscriptionIntercept(true);
      }
    }

    setSelectedRequest(req);
    try {
      const res = await fetch(`/api/requests/${req._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullReq = await res.json();
        setSelectedRequest((prev: any) => {
          if (prev && prev._id === req._id) return fullReq;
          return prev;
        });
        setRequests((prev) =>
          prev.map((r) => (r._id === req._id ? fullReq : r)),
        );
      }
    } catch (err) {
      console.error(err);
    }

    if (
      (isWorker &&
        ((req.workerUnreadCount && req.workerUnreadCount > 0) ||
          !req.isRead)) ||
      (!isWorker &&
        ((req.clientUnreadCount && req.clientUnreadCount > 0) ||
          req.clientHasUnread))
    ) {
      handleMarkAsRead(req._id);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Erreur");
      setRequests(data);
      if (location.state?.selectedRequestId) {
        const targetReq = data.find((r: any) => r._id === location.state.selectedRequestId);
        if (targetReq) {
          handleSelectRequest(targetReq);
        }
        window.history.replaceState({}, document.title);
      }

      const params = new URLSearchParams(window.location.search);
      const chatId = params.get('chat');
      if (chatId) {
        const targetReq = data.find((r: any) => String(r._id) === String(chatId));
        if (targetReq) {
          handleSelectRequest(targetReq);
          // Build new URL without the 'chat' param only if found
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } else {
          // If not found yet, it might arrive via socket or be delayed.
          console.warn(`[Dashboard] Could not find request ${chatId} in initial fetch.`);
        }
      }
      if (socketRef.current) {
        const uids: string[] = [];
        data.forEach((r: any) => {
           if (r.workerId && typeof r.workerId === 'object' && r.workerId._id) uids.push(r.workerId._id);
           if (r.clientId && typeof r.clientId === 'object' && r.clientId._id) uids.push(r.clientId._id);
        });
        if (uids.length > 0) {
           socketRef.current.emit("checkStatus", [...new Set(uids)]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const targetReq = requests.find((r) => r._id === id);
      if (status === "accepted" && targetReq?.tenderId) {
        const tenderRes = await fetch(
          `/api/tenders/${targetReq.tenderId}/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              workerId: targetReq.workerId?._id || targetReq.workerId,
            }),
          },
        );
        if (tenderRes.ok) {
          toast.success(
            "Offre acceptée depuis le chat. Redirection vers vos publications...",
          );
          setTimeout(() => {
            navigate("/appels-offres", {
              state: {
                activeTab: "my_tenders",
                scrollToTender: targetReq.tenderId,
              },
            });
          }, 1000);
        }
      }

      const res = await fetch(`/api/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === id ? updatedData : r)));
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest(updatedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur de suppression");
      }
      
      setToastMessage("Demande supprimée avec succès");
      setTimeout(() => setToastMessage(null), 3000);
      
      // Update local state proactively
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest(null);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isRead: true } : r)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartRecordingReply = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      replyMediaRecorderRef.current = mediaRecorder;
      replyAudioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          replyAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(replyAudioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setReplyAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setReplyAudioData(reader.result as string);
        };
      };

      mediaRecorder.start();
      setIsRecordingReply(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Impossible d'accéder au microphone.");
    }
  };

  const handleStopRecordingReply = () => {
    if (replyMediaRecorderRef.current && isRecordingReply) {
      replyMediaRecorderRef.current.stop();
      replyMediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecordingReply(false);
    }
  };

  const clearRecordingReply = () => {
    setReplyAudioData(null);
    setReplyAudioUrl(null);
  };

  const handleReplyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProposeOffer = async () => {
    if (!selectedRequest) return;
    setIsProcessingOffer(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest._id}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: "[[SYS_OFFER_PROPOSAL]]" }),
      });
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === selectedRequest._id ? updatedData : r)));
      setSelectedRequest(updatedData);
      toast.success("Proposition envoyée, en attente de confirmation.");
    } catch(err) {
      toast.error("Erreur d'envoi");
    } finally {
      setIsProcessingOffer(false);
    }
  };

  const acceptOffer = async (reqToAccept: any) => {
    setIsProcessingOffer(true);
    try {
      // 1. Update status
      await fetch(`/api/requests/${reqToAccept._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "accepted" })
      });
      
      // 2. If it's a tender, also update tender (if applicable, best effort)
      if (reqToAccept.tenderId) {
         try {
             await fetch(`/api/tenders/${reqToAccept.tenderId._id || reqToAccept.tenderId}/accept`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                 body: JSON.stringify({ workerId: reqToAccept.workerId._id || reqToAccept.workerId }),
             });
         } catch(e) {}
      }

      // 3. Send confirmation message
      const res = await fetch(`/api/requests/${reqToAccept._id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: "[[SYS_OFFER_CONFIRMED]]" }),
      });
      
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === reqToAccept._id ? updatedData : r)));
      if (selectedRequest?._id === reqToAccept._id) {
        setSelectedRequest(updatedData);
      }
      setShowOfferSuccessModal(true);
      toast.success("L'accord a été confirmé unaniment !");
      playBeep();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
        new Notification("AfriWork", { body: "L'accord a été confirmé pour votre demande." });
      }
    } catch(err) {
      toast.error("Erreur de confirmation");
    } finally {
      setIsProcessingOffer(false);
    }
  };

  const refuseOffer = async (reqToRefuse: any) => {
    setIsProcessingOffer(true);
    try {
      // Update status to rejected
      await fetch(`/api/requests/${reqToRefuse._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" })
      });

      const res = await fetch(`/api/requests/${reqToRefuse._id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: "[[SYS_OFFER_REFUSED]]" }),
      });
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === reqToRefuse._id ? updatedData : r)));
      if (selectedRequest?._id === reqToRefuse._id) {
        setSelectedRequest(updatedData);
      }
    } catch(err) {
      toast.error("Erreur");
    } finally {
      setIsProcessingOffer(false);
    }
  };

  const handleConfirmOffer = async () => {
    if (!offerConfirmRequest) return;
    await acceptOffer(offerConfirmRequest);
    setOfferConfirmRequest(null);
  };

  const handleRefuseOffer = async () => {
    if (!offerConfirmRequest) return;
    await refuseOffer(offerConfirmRequest);
    setOfferConfirmRequest(null);
  };

  const handleDirectAgreement = async (reqToUpdate: any, action: 'accept' | 'decline') => {
    setIsProcessingOffer(true);
    try {
      const res = await fetch(`/api/requests/${reqToUpdate._id}/direct-agreement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error("Erreur");
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === reqToUpdate._id ? updatedData : r)));
      if (selectedRequest?._id === reqToUpdate._id) {
        setSelectedRequest(updatedData);
      }
      if (action === 'accept' && updatedData.status === 'accepted') {
          setShowOfferSuccessModal(true);
          toast.success("L'accord a été confirmé unaniment !");
          playBeep();
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
            new Notification("AfriWork", { body: "L'accord a été confirmé pour votre demande." });
          }
      }
    } catch(err) {
      toast.error("Erreur");
    } finally {
      setIsProcessingOffer(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || isSubmittingReply) return;
    if (!replyText && !replyAudioData && !replyAttachmentUrl) {
      toast.error("Veuillez saisir un message, une pièce jointe ou un audio.");
      return;
    }

    const optimisticMsg = {
      _id: "temp_" + Date.now(),
      text: replyText,
      audioData: replyAudioData,
      attachmentUrl: replyAttachmentUrl,
      senderId: user?._id || "",
      createdAt: new Date().toISOString(),
    };

    const optimisticReq = {
      ...selectedRequest,
      responses: [...(selectedRequest.responses || []), optimisticMsg]
    };

    // Optimistic UI update
    setSelectedRequest(optimisticReq);
    setRequests((prev) =>
      prev.map((r) => (r._id === selectedRequest._id ? optimisticReq : r)),
    );

    const textPayload = replyText;
    const audioPayload = replyAudioData;
    const attachmentPayload = replyAttachmentUrl;

    setReplyText("");
    clearRecordingReply();
    setReplyAttachmentUrl(null);

    setIsSubmittingReply(true);
    try {
      const res = await fetch(
        `/api/requests/${selectedRequest._id}/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: textPayload,
            audioData: audioPayload,
            attachmentUrl: attachmentPayload,
          }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur du serveur");
      }
      const updatedData = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r._id === selectedRequest._id ? updatedData : r)),
      );
      if (selectedRequest._id === updatedData._id) {
         setSelectedRequest(updatedData);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur: " + error.message);
      // Rollback optimistic update on error
      setRequests((prev) =>
        prev.map((r) => (r._id === selectedRequest._id ? selectedRequest : r)),
      );
      setSelectedRequest(selectedRequest);
    } finally {
      setIsSubmittingReply(false);
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
      const res = await fetch("/api/users/transfer-affiliate", {
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
      login(data.user, token!); // update user in context
      toast.success("Transfert réussi vers votre solde portefeuille !");
      setShowTransferModal(false);
      setTransferAmount("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const fetchTransferHistory = async (type: string = "affiliate_all") => {
    setIsLoadingHistory(true);
    setHistoryType(type as "wallet" | "transfer_affiliate" | "affiliate_all");
    setHistoryFilterType("all");
    setHistorySortOrder("desc");
    setShowTransferHistoryModal(true);
    try {
      const res = await fetch(`/api/users/transfer-history?type=${type}`, {
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

  const handleMockSubscribe = (planId: string, amount: number) => {
    setDepositPlanId(planId);
    setDepositAmount(amount);
    setDepositMethod("");
    setShowPlanBenefitsModal(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositMethod) {
      toast.error("Veuillez choisir une méthode de dépôt/paiement.");
      return;
    }

    setIsDepositing(true);
    const [planType, planDuration] = depositPlanId.split("_"); // worker_monthly, worker_yearly etc
    const plan = planType === "worker" ? "pro" : "standard";
    const duration = planDuration || "monthly";

    try {
      if (depositMethod === "Carte Visa") {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan,
            duration,
          }),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(
            d.error || "Erreur lors de la création de la session",
          );
        }

        const { url } = await res.json();
        if (url) {
          // Rediriger vers la page Stripe Checkout
          window.location.href = url;
        }
      } else {
        // Pour les autres méthodes: appeler une route pour enregistrer (ou utiliser le mock)
        const res = await fetch("/api/paystack/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: depositPlanId,
            paymentMethod:
              depositMethod === "Crypto (USDT)"
                ? "crypto"
                : depositMethod === "PayPal"
                  ? "paypal"
                  : "mobile_money",
          }),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(
            d.error || "Erreur lors de la création de la session",
          );
        }

        const data = await res.json();
        setIsDepositing(false);
        setShowDepositModal(false);

        if (data.url && data.url.includes("http")) {
          window.location.href = data.url;
        } else {
          toast.success(
            `Dépôt via ${depositMethod} enregistré. (Simulation réussie).`,
          );
          window.location.reload();
        }
      }
    } catch (err: any) {
      console.error("Erreur Checkout", err);
      toast.error(
        "Erreur de paiement : " + (err.message || "Une erreur est survenue."),
      );
      setIsDepositing(false);
    }
  };

  const handleOpenEditProfile = () => {
    setProfileSaved(false);
    setIsEditingPassword(false);
    setIsGeneratingDesc(false);
    setIsGeneratingShortDesc(false);
    setIsEditProfileOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name?.trim()) {
      toast.error("Le nom complet est obligatoire.");
      return;
    }
    if (
      editFormData.newPassword &&
      editFormData.newPassword !== editFormData.newPasswordConfirm
    ) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (!editFormData.phoneNumber?.trim()) {
      toast.error("Le numéro de téléphone est obligatoire.");
      return;
    }
    if (!editFormData.sameAsPhone && !editFormData.whatsappNumber?.trim()) {
      toast.error(
        "Le numéro WhatsApp est obligatoire s'il est différent du téléphone.",
      );
      return;
    }
    if (isWorker && !editFormData.photo) {
      toast.error("La photo de profil est obligatoire pour les artisans.");
      return;
    }
    if (isWorker && !editFormData.profession?.trim()) {
      toast.error("Votre métier/qualification est obligatoire.");
      return;
    }

    setIsSubmittingProfile(true);
    setSubmitProfileProgress(0);
    setProfileSaved(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSubmitProfileProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const submitData = {
        ...editFormData,
        phone: `${editFormData.phonePrefix} ${editFormData.phoneNumber}`,
        whatsappPhone: editFormData.sameAsPhone
          ? `${editFormData.phonePrefix} ${editFormData.phoneNumber}`
          : `${editFormData.whatsappPrefix} ${editFormData.whatsappNumber}`,
      };

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        if (res.status === 413) {
          throw new Error(
            "Fichier trop volumineux. La limite de taille du serveur (4.5 Mo) a été atteinte pour la photo ou le portfolio.",
          );
        }
        const text = await res.text().catch(() => "");
        throw new Error(
          res.status === 413 || text.includes("Request Entity Too Large")
            ? "Fichier trop volumineux (limite du serveur atteinte)."
            : "Erreur serveur : réponse invalide.",
        );
      }

      clearInterval(progressInterval);
      setSubmitProfileProgress(100);

      if (!res.ok) throw new Error(data.error || "Erreur pdt la mise à jour");

      setTimeout(() => {
        setUser({ ...user, ...data });
        setProfileSaved(true);
        setIsSubmittingProfile(false);
      }, 300);
    } catch (error: any) {
      clearInterval(progressInterval);
      setIsSubmittingProfile(false);
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary n'est pas configuré. Veuillez vérifier les variables d'environnement.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    setIsUploadingCloudinary(true);
    setCloudinaryProgress(0);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          setCloudinaryProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorResponse.error?.message || "Erreur lors de l'upload.",
              ),
            );
          } catch (e) {
            reject(new Error("Erreur lors de l'upload vers Cloudinary."));
          }
        }
        setIsUploadingCloudinary(false);
      };

      xhr.onerror = () => {
        reject(new Error("Erreur de réseau lors de l'upload."));
        setIsUploadingCloudinary(false);
      };

      xhr.send(formData);
    });
  };

  const handleUpdateProfilePhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        file = await imageCompression(file, options);
      } catch (error) {
        console.error("Compression error:", error);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({
          ...editFormData,
          photo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPortfolioImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newImages: string[] = [];

      for (let file of files) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();

          const result = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });

          newImages.push(result);
        } catch (error) {
          console.error("Compression error:", error);
        }
      }

      if (newImages.length > 0) {
        setEditFormData((prev: any) => ({
          ...prev,
          portfolio: [...(prev.portfolio || []), ...newImages],
        }));
      }
    }
  };

  const handleRemovePortfolioImage = (index: number) => {
    const updated = [...(editFormData.portfolio || [])];
    updated.splice(index, 1);
    setEditFormData({
      ...editFormData,
      portfolio: updated,
    });
  };

  useEffect(() => {
    let interval: any;
    if (user?.kycStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const updatedUser = await res.json();
            if (
              updatedUser.kycStatus === "verified" ||
              updatedUser.kycStatus === "rejected"
            ) {
              setUser(updatedUser);
              toast.success(
                `Votre KYC a été ${updatedUser.kycStatus === "verified" ? "approuvé" : "rejeté"} !`,
              );
            }
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user?.kycStatus, token, setUser]);

  const handleCompleteKyc = async () => {
    setIsKycLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycStatus: "pending" }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        toast.success(
          "Votre demande KYC a été soumise avec succès et est en attente de validation.",
        );
      } else {
        toast.error("Erreur lors de la vérification.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur serveur.");
    } finally {
      setIsKycLoading(false);
    }
  };

  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(
    localStorage.getItem("fingerprint_enabled") === "true",
  );

  const handleToggleFingerprint = async () => {
    if (!isFingerprintEnabled) {
      setLoading(true);
      try {
        let biometricKey =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        if (window.PublicKeyCredential) {
          try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            const userId = new Uint8Array(16);
            window.crypto.getRandomValues(userId);

            const credential = await navigator.credentials.create({
              publicKey: {
                challenge: challenge,
                rp: { name: "Artisan ChapChap", id: window.location.hostname },
                user: {
                  id: userId,
                  name: user?.email || "user",
                  displayName: user?.name || "User",
                },
                pubKeyCredParams: [
                  { alg: -7, type: "public-key" },
                  { alg: -257, type: "public-key" },
                ],
                authenticatorSelection: {
                  authenticatorAttachment: "platform",
                  userVerification: "required",
                },
                timeout: 60000,
                attestation: "none",
              },
            });
            if (credential) {
              biometricKey = credential.id;
            }
          } catch (err) {
            console.warn("WebAuthn failed, falling back to mock", err);
            if (
              !window.confirm(
                "Authentification biométrique native non disponible. Simuler l'enregistrement de votre empreinte ?",
              )
            ) {
              setLoading(false);
              return;
            }
          }
        } else {
          if (
            !window.confirm(
              "Simuler l'enregistrement de votre empreinte digitale pour vos prochaines connexions ?",
            )
          ) {
            setLoading(false);
            return;
          }
        }

        await fetch("/api/users/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ biometricKey }),
        });

        localStorage.setItem("fingerprint_enabled", "true");
        // Store email and biometric key
        localStorage.setItem(
          "demo_biometric_key",
          JSON.stringify({ email: user?.email, biometricKey }),
        );
        setIsFingerprintEnabled(true);
        setUser({ ...user!, fingerprintEnabled: true });
        toast.success("Empreinte activée avec succès !");
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de l'activation de l'empreinte.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await fetch("/api/users/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ biometricKey: "" }), // clear it
        });
        localStorage.removeItem("fingerprint_enabled");
        localStorage.removeItem("demo_biometric_key");
        setIsFingerprintEnabled(false);
        setUser({ ...user!, fingerprintEnabled: false });
        toast.success("L'empreinte a été désactivée.");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ""}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || "");
    toast.success("Code de parrainage copié !");
  };

  const handleShareCode = async () => {
    const shareData = {
      title: "Mon code Artisan ChapChap",
      text: `Utilise mon code de parrainage ${user?.referralCode || ""} lors de ton inscription sur Artisan ChapChap !`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Erreur partage:", err);
      }
    } else {
      toast.error(
        "Votre navigateur ne supporte pas le partage natif. Veuillez copier le code.",
      );
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Lien de parrainage copié !");
  };

  const handleShareReferral = async () => {
    const shareData = {
      title: "Rejoignez Artisan ChapChap !",
      text: `J'utilise Artisan ChapChap (la plateforme n°1 des artisans). Inscris-toi avec mon code de parrainage ${user?.referralCode || ""} et commençons à gagner !`,
      url: referralLink,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Erreur partage:", err);
      }
    } else {
      toast.error(
        "Votre navigateur ne supporte pas le partage natif. Veuillez copier le lien.",
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront effacées promptement.",
      )
    ) {
      return;
    }
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Votre compte a été supprimé.");
        logout();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression du compte.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur serveur est survenue.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedRequest.workerId?._id) return;
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Veuillez donner une note entre 1 et 5.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch(
        `/api/users/workers/${selectedRequest.workerId._id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      toast.success("Merci pour votre avis !");
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 1000) {
      toast.success("Le montant minimum est de 1000 FCFA.");
      return;
    }
    if (!withdrawMethod) {
      toast.error("Veuillez choisir une méthode de retrait.");
      return;
    }
    if (withdrawAmount > computedWalletBalance) {
      toast.error("Fonds insuffisants.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/users/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawMethod,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success(
          `Demande de retrait de ${withdrawAmount} FCFA via ${withdrawMethod} enregistrée avec succès. Un administrateur va la valider bientôt.`,
        );
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setWithdrawMethod("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la demande de retrait.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur serveur.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const isWorker = user.role === "worker";
  const isAuthor = (req: any) =>
    user &&
    req.clientId &&
    (req.clientId === user._id || req.clientId._id === user._id);
  const unreadCount = isWorker
    ? requests.reduce(
        (acc, req) => acc + (req.workerUnreadCount || (req.isRead ? 0 : 1)),
        0,
      )
    : requests.reduce(
        (acc, req) =>
          acc + (req.clientUnreadCount || (req.clientHasUnread ? 1 : 0)),
        0,
      );

  const workerDirectRequests = requests.filter(r => !r.tenderId);
  const workerTenderRequests = requests.filter(r => r.tenderId);

  const directPendingCount = workerDirectRequests.filter(r => r.status === 'pending').length;
  const directAcceptedCount = workerDirectRequests.filter(r => r.status === 'accepted').length;
  const directCompletedCount = workerDirectRequests.filter(r => r.status === 'completed').length;
  const directRejectedCount = workerDirectRequests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

  const tenderPendingCount = workerTenderRequests.filter(r => r.status === 'pending').length;
  const tenderAcceptedCount = workerTenderRequests.filter(r => r.status === 'accepted').length;
  const tenderCompletedCount = workerTenderRequests.filter(r => r.status === 'completed').length;
  const tenderRejectedCount = workerTenderRequests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

  const clientTenderRequests = requests.filter(r => r.tenderId);
  const clientDirectRequests = requests.filter(r => !r.tenderId);

  const clientDirectTotalCount = clientDirectRequests.length;
  const clientDirectPendingCount = clientDirectRequests.filter(r => r.status === 'pending').length;
  const clientDirectAcceptedCount = clientDirectRequests.filter(r => r.status === 'accepted' || r.status === 'completed').length;
  const clientDirectRejectedCount = clientDirectRequests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

  const clientPublishedTendersCount = myTenders.length;
  const clientQuotesReceivedCount = clientTenderRequests.length;
  const clientQuotesConsultedCount = clientTenderRequests.filter(r => !r.clientHasUnread && (!r.clientUnreadCount || r.clientUnreadCount === 0)).length;
  const clientQuotesUnconsultedCount = clientTenderRequests.filter(r => r.clientHasUnread || r.clientUnreadCount > 0).length;
  const clientQuotesAcceptedCount = clientTenderRequests.filter(r => r.status === 'accepted' || r.status === 'completed').length;

  const filteredRequests = requests.filter(r => {
    // text search
    if (requestSearch) {
      const searchStr = requestSearch.toLowerCase();
      const serviceDetails = (r.serviceDetails || "").toLowerCase();
      const clientName = (r.clientId?.name || r.clientId?.companyName || "").toLowerCase();
      const workerName = (r.workerId?.name || r.workerId?.companyName || "").toLowerCase();
      const tenderTitle = (r.tenderId?.title || "").toLowerCase();
      if (!serviceDetails.includes(searchStr) && !clientName.includes(searchStr) && !workerName.includes(searchStr) && !tenderTitle.includes(searchStr)) {
        return false;
      }
    }

    if (isWorker) {
      if (workerRequestFilter === "all") return true;
      if (workerRequestFilter.startsWith("direct-")) {
        if (r.tenderId) return false;
        const status = workerRequestFilter.split("-")[1];
        if (status === "all") return true;
        if (status === "rejected") return r.status === "rejected" || r.status === "cancelled";
        return r.status === status;
      }
      if (workerRequestFilter.startsWith("tender-")) {
        if (!r.tenderId) return false;
        const status = workerRequestFilter.split("-")[1];
        if (status === "all") return true;
        if (status === "rejected") return r.status === "rejected" || r.status === "cancelled";
        return r.status === status;
      }
      return true;
    }
    switch(clientRequestFilter) {
      case 'tender-received': return r.tenderId != null;
      case 'tender-accepted': return r.tenderId != null && (r.status === 'accepted' || r.status === 'completed');
      case 'tender-consulted': return r.tenderId != null && !r.clientHasUnread && (!r.clientUnreadCount || r.clientUnreadCount === 0);
      case 'tender-unconsulted': return r.tenderId != null && (r.clientHasUnread || r.clientUnreadCount > 0);
      case 'direct-all': return r.tenderId == null;
      case 'direct-pending': return r.tenderId == null && r.status === 'pending';
      case 'direct-accepted': return r.tenderId == null && (r.status === 'accepted' || r.status === 'completed');
      case 'direct-rejected': return r.tenderId == null && (r.status === 'rejected' || r.status === 'cancelled');
      default: return true;
    }
  }).sort((a, b) => {
    if (isWorker) return 0;
    if (clientRequestSort === "date-desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (clientRequestSort === "date-asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (clientRequestSort === "status") {
      return (a.status || "").localeCompare(b.status || "");
    }
    if (clientRequestSort === "amount") {
      // Find the first proposed price in responses
      const priceA = a.responses?.find((res: any) => typeof res.price === 'number')?.price || 0;
      const priceB = b.responses?.find((res: any) => typeof res.price === 'number')?.price || 0;
      return priceA - priceB;
    }
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 flex items-center gap-3 pointer-events-none"
          >
            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                disabled={isSubmittingReview}
              >
                <XCircle size={20} />
              </button>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Noter l'artisan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Partagez votre expérience avec cet artisan. Que pensez-vous de
                la qualité du service ?
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Note sur 5
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-2 transition-transform hover:scale-110 focus:outline-none ${reviewRating >= star ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}`}
                        disabled={isSubmittingReview}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Commentaire (facultatif)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Laissez un petit mot..."
                    rows={4}
                    disabled={isSubmittingReview}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    disabled={isSubmittingReview}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || reviewRating === 0}
                    className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Affiliate Revenue Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowTransferModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Transférer mes gains
              </h2>

              <form onSubmit={handleTransferSubmit}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Montant à transférer (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={
                        (user.referralStats?.totalRevenue || 0) -
                        (user.referralStats?.transferredRevenue || 0)
                      }
                      value={transferAmount}
                      onChange={(e) =>
                        setTransferAmount(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTransferModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isTransferring}
                      className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                    >
                      {isTransferring ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Transférer"
                      )}
                    </button>
                  </div>
                </div>
              </form>
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Demande de Retrait
              </h2>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Montant à retirer (FCFA)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={computedWalletBalance}
                    value={withdrawAmount}
                    onChange={(e) =>
                      setWithdrawAmount(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-200"
                    placeholder="Min: 1000"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Solde disponible :{" "}
                    {computedWalletBalance.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Méthode de retrait
                  </label>
                  <CustomSelect
                    value={withdrawMethod}
                    onChange={(val) => {
                      const userCountry = user?.country;
                      const adminConfig = (
                        settings?.withdrawMethodsByCountry || []
                      ).find((c: any) => c.country === userCountry);
                      const activatedMethods = adminConfig?.methods || [];
                      const isUniversal = [
                        "Carte Visa",
                        "PayPal",
                        "Crypto (USDT)",
                      ].includes(val);

                      if (!isUniversal && !activatedMethods.includes(val)) {
                        toast.error(
                          `Le moyen de paiement "${val}" n'est pas encore activé par l'administrateur dans votre pays. Il sera disponible très bientôt.`,
                        );
                        return;
                      }
                      setWithdrawMethod(val);
                    }}
                    placeholder="Sélectionnez une méthode"
                    options={(() => {
                      const userCountry = user?.country;
                      const adminConfig = (
                        settings?.withdrawMethodsByCountry || []
                      ).find((c: any) => c.country === userCountry);
                      const localMethods = userCountry
                        ? LOCAL_PAYMENT_METHODS_BY_COUNTRY[userCountry] || []
                        : [];
                      const activatedMethods = adminConfig?.methods || [];
                      const methods = [
                        "Carte Visa",
                        "PayPal",
                        "Crypto (USDT)",
                        ...localMethods,
                        ...activatedMethods,
                      ];

                      return Array.from(new Set(methods)).map((m: any) => {
                        const mStr = String(m || "");
                        const isUniversal = [
                          "Carte Visa",
                          "PayPal",
                          "Crypto (USDT)",
                        ].includes(mStr);
                        const isActivated =
                          isUniversal || activatedMethods.includes(mStr);

                        return {
                          label: (
                            <span className="flex items-center gap-3">
                              {PAYMENT_LOGOS[mStr] ? (
                                <img
                                  src={PAYMENT_LOGOS[mStr]}
                                  alt={mStr}
                                  className={`w-8 h-8 object-contain rounded-md ${!isActivated ? "opacity-50 grayscale" : ""}`}
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center font-bold text-[10px] text-slate-500 ${!isActivated ? "opacity-50" : ""}`}
                                >
                                  {mStr.substring(0, 3).toUpperCase()}
                                </div>
                              )}
                              <span
                                className={!isActivated ? "text-slate-400" : ""}
                              >
                                {mStr}
                              </span>
                              {!isActivated && (
                                <Lock
                                  size={14}
                                  className="text-slate-400 ml-auto"
                                />
                              )}
                            </span>
                          ),
                          value: m,
                        };
                      });
                    })()}
                    className="w-full"
                  />
                </div>

                <div className="pt-2">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 text-sm text-amber-900 dark:text-amber-200/80 flex gap-3 items-start">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                    <p>
                      <strong className="block mb-1 text-amber-800 dark:text-amber-500">
                        Conditions d'éligibilité & de retrait :
                      </strong>
                      Pour bénéficier de vos commissions, vous devez vous-même
                      disposer d'un abonnement actif (en cas d'expiration, les
                      gains sont gelés). De plus, le retrait est possible à
                      partir de <strong>1 000 FCFA</strong> accumulés.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      isWithdrawing || !withdrawAmount || !withdrawMethod
                    }
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center"
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
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {historyType === "affiliate_all"
                  ? "Historique d'Affiliation"
                  : "Historique des transactions"}
              </h2>

              {historyType === "affiliate_all" && (
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
                      Commissions
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

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {isLoadingHistory ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  </div>
                ) : (
                  (() => {
                    const filtered = transferHistory
                      .filter(
                        (tx) =>
                          historyType !== "affiliate_all" ||
                          historyFilterType === "all" ||
                          tx.type === historyFilterType ||
                          (historyFilterType === "withdrawal" &&
                            tx.type === "transfer"),
                      )
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

                    return filtered.map((tx: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">
                            {tx.type === "commission"
                              ? tx.description
                              : tx.type === "withdrawal"
                                ? "Retrait effectué"
                                : "Transfert"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(tx.date || tx.createdAt).toLocaleString(
                              "fr-FR",
                            )}
                          </div>
                        </div>
                        <div
                          className={`font-black text-lg ${["withdrawal", "transfer"].includes(tx.type) ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
                        >
                          {["withdrawal", "transfer"].includes(tx.type)
                            ? "-"
                            : "+"}
                          {tx.amount.toLocaleString("fr-FR")}{" "}
                          <span className="text-sm font-medium">FCFA</span>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Benefits Modal */}
      <AnimatePresence>
        {showPlanBenefitsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowPlanBenefitsModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Avantages de l'Abonnement{" "}
                    {depositPlanId === "worker_quarterly"
                      ? "Trimestriel"
                      : depositPlanId === "worker_semiannual"
                        ? "Semestriel"
                        : depositPlanId === "worker_yearly"
                          ? "Annuel"
                          : "Pro"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Débloquez tout le potentiel de la plateforme
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  "Toutes les fonctionnalités incluses",
                  "Notifications SMS pour les nouvelles opportunités",
                  "Assistance dédiée"
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-snug">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Durée d'engagement</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {depositPlanId === "worker_quarterly"
                      ? "3 Mois (Trimestriel)"
                      : depositPlanId === "worker_semiannual"
                        ? "6 Mois (Semestriel)"
                        : depositPlanId === "worker_yearly"
                          ? "12 Mois (Annuel)"
                          : "Inconnue"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Montant total</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {depositAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Date d'abonnement prévue</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    }).format(new Date())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Date d'expiration prévue</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    }).format(
                      new Date(
                        new Date().setMonth(
                          new Date().getMonth() +
                            (depositPlanId === "worker_quarterly"
                              ? 3
                              : depositPlanId === "worker_semiannual"
                                ? 6
                                : depositPlanId === "worker_yearly"
                                  ? 12
                                  : 1)
                        )
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowPlanBenefitsModal(false);
                    setShowDepositModal(true);
                  }}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                >
                  Payer l'abonnement maintenant
                </button>
                <button
                  onClick={() => setShowPlanBenefitsModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-xl transition-colors"
                >
                  Choisir un autre plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowDepositModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Demande de Dépôt (Abonnement)
              </h2>
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Montant à payer (FCFA)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 dark:text-slate-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    L'abonnement sera activé pour la formule choisie.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Méthode de dépôt/paiement
                  </label>
                  <CustomSelect
                    value={depositMethod}
                    onChange={(val) => {
                      const userCountry = user?.country;
                      const adminConfig = (
                        settings?.depositMethodsByCountry || []
                      ).find((c: any) => c.country === userCountry);
                      const activatedMethods = adminConfig?.methods || [];
                      const isUniversal = [
                        "Carte Visa",
                        "PayPal",
                        "Crypto (USDT)",
                      ].includes(val);

                      if (!isUniversal && !activatedMethods.includes(val)) {
                        toast.error(
                          `Le moyen de paiement "${val}" n'est pas encore activé par l'administrateur dans votre pays. Il sera disponible très bientôt.`,
                        );
                        return;
                      }
                      setDepositMethod(val);
                    }}
                    placeholder="Sélectionnez une méthode"
                    options={(() => {
                      const userCountry = user?.country;
                      const adminConfig = (
                        settings?.depositMethodsByCountry || []
                      ).find((c: any) => c.country === userCountry);
                      const localMethods = userCountry
                        ? LOCAL_PAYMENT_METHODS_BY_COUNTRY[userCountry] || []
                        : [];
                      const activatedMethods = adminConfig?.methods || [];
                      const methods = [
                        "Carte Visa",
                        "PayPal",
                        "Crypto (USDT)",
                        ...localMethods,
                        ...activatedMethods,
                      ];

                      return Array.from(new Set(methods)).map((m: any) => {
                        const mStr = String(m || "");
                        const isUniversal = [
                          "Carte Visa",
                          "PayPal",
                          "Crypto (USDT)",
                        ].includes(mStr);
                        const isActivated =
                          isUniversal || activatedMethods.includes(mStr);

                        return {
                          label: (
                            <span className="flex items-center gap-3">
                              {PAYMENT_LOGOS[mStr] ? (
                                <img
                                  src={PAYMENT_LOGOS[mStr]}
                                  alt={mStr}
                                  className={`w-8 h-8 object-contain rounded-md ${!isActivated ? "opacity-50 grayscale" : ""}`}
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center font-bold text-[10px] text-slate-500 ${!isActivated ? "opacity-50" : ""}`}
                                >
                                  {mStr.substring(0, 3).toUpperCase()}
                                </div>
                              )}
                              <span
                                className={!isActivated ? "text-slate-400" : ""}
                              >
                                {mStr}
                              </span>
                              {!isActivated && (
                                <Lock
                                  size={14}
                                  className="text-slate-400 ml-auto"
                                />
                              )}
                            </span>
                          ),
                          value: m,
                        };
                      });
                    })()}
                    className="w-full"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isDepositing || !depositAmount || !depositMethod}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                  >
                    {isDepositing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Confirmer le paiement"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 mt-8 mb-8">
        
        {/* Left Column: Espace Pro & Fingerprint */}
        <div className="flex flex-col gap-6 w-full lg:w-auto flex-1 justify-center">
          <div className="flex items-center gap-5 w-full lg:w-auto">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover shadow-lg shadow-slate-900/10"
              />
            ) : (
              <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white relative inline-block">
                  Espace {isWorker ? "Pro" : "Client"}
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        const firstUnread = requests.find((r) =>
                          isWorker
                            ? (r.workerUnreadCount && r.workerUnreadCount > 0) ||
                              !r.isRead
                            : (r.clientUnreadCount && r.clientUnreadCount > 0) ||
                              r.clientHasUnread,
                        );
                        if (firstUnread) {
                          handleSelectRequest(firstUnread);
                        }
                      }}
                      className="absolute -top-3 -right-2 translate-x-full flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-2xl rounded-bl-sm animate-bounce shadow-lg shadow-red-500/30 cursor-pointer hover:bg-red-600 transition-colors whitespace-nowrap z-10"
                      title="Nouveau message"
                    >
                      <MessageCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm font-bold">{unreadCount}</span>
                    </button>
                  )}
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                Bienvenue,{" "}
                <span className="font-medium text-slate-900 dark:text-white">
                  {user.name}
                </span>
                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                {user.kycStatus === "verified" && (
                  <span className="hidden sm:flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                    <ShieldCheck className="w-3 h-3" /> Vérifié
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={handleOpenEditProfile}
              className="hidden md:flex ml-auto items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4" /> Éditer le profil
            </button>
          </div>

          <button
            onClick={handleOpenEditProfile}
            className="w-full md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors text-sm mb-2"
          >
            <Edit3 className="w-4 h-4" /> Éditer mon profil
          </button>

          {/* Fingerprint configuration grid inside left column */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-5 w-full">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isFingerprintEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 dark:text-slate-400"}`}
            >
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                Connexion par empreinte
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 tracking-tight leading-snug break-words hyphens-auto mb-1">
                {isFingerprintEnabled
                  ? "Votre empreinte est configurée pour vous connecter rapidement."
                  : "Configurez votre empreinte digitale pour un accès rapide sans mot de passe."}
              </p>
            </div>
            <button
              onClick={handleToggleFingerprint}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isFingerprintEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
              role="switch"
              aria-checked={isFingerprintEnabled}
            >
              <span className="sr-only">Connexion par empreinte</span>
              <span
                className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${isFingerprintEnabled ? "translate-x-7" : "translate-x-1"}`}
              >
                {isFingerprintEnabled ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" strokeWidth={3} />
                )}
              </span>
            </button>
          </div>

          {/* Account Profile Switcher */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-5 w-full mt-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
               <UserPlus className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                 {hasAltAccount ? "Changer de profil" : ("Créer un profil " + (user.role === 'client' ? 'Artisan' : 'Client'))}
               </h4>
               <p className="text-sm text-slate-500 dark:text-slate-400 tracking-tight leading-snug break-words hyphens-auto mb-1">
                 {hasAltAccount ? "Basculez rapidement vers votre autre compte." : "Créez votre deuxième compte avec le même email."}
               </p>
            </div>
            <button
               onClick={() => {
                  if (hasAltAccount) {
                    handleSwitchAccount();
                  } else {
                    window.location.href = `/register?email=${encodeURIComponent(user.email || "")}&role=${user.role === 'client' ? 'worker' : 'client'}`;
                  }
               }}
               disabled={isSwitching}
               className="relative inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50 shrink-0 shadow-sm"
            >
               {isSwitching ? "..." : (hasAltAccount ? "Basculer" : "Ajouter")}
            </button>
          </div>
        </div>

        {/* Subscription Widget MVP */}
        {isWorker && (
          <div id="abonnements" className="bg-gradient-to-br from-brand-500 to-brand-700 p-5 rounded-2xl flex flex-col text-white shadow-lg shadow-brand-500/30 w-full lg:max-w-xs ring-2 ring-accent-400 ring-offset-2 shrink-0 h-fit">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm">
                  {user.subscription?.activeUntil &&
                  new Date(user.subscription.activeUntil) >= new Date()
                    ? <span className="font-bold text-emerald-400">Statut : Actif</span>
                    : user.subscription?.activeUntil
                      ? <span className="font-bold text-red-400">Statut : Expiré</span>
                      : <span className="font-bold text-red-400">Statut : Inactif</span>}
                </p>
                <p className="font-bold text-lg leading-tight">
                  Abonnement Pro
                </p>
              </div>
            </div>

            {user.subscription?.activeUntil &&
            new Date(user.subscription.activeUntil) >= new Date() ? (
              <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center justify-center mb-4">
                <p className="text-xs text-brand-100 uppercase tracking-widest font-bold mb-1">
                  Temps Restant
                </p>
                <p className="text-lg font-mono font-bold tracking-wider">
                  {subscriptionTimeRemaining || "Calcul..."}
                </p>
              </div>
            ) : null}

            <p className="text-xs text-brand-100 text-center mb-2 font-medium">
              {user.subscription?.activeUntil &&
              new Date(user.subscription.activeUntil) >= new Date()
                ? "Prolonger l'abonnement"
                : "Choisir un forfait"}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleMockSubscribe(
                    "worker_quarterly",
                    settings?.subscriptionPrices?.workerQuarterly || 5000,
                  )
                }
                className="w-full bg-white dark:bg-slate-900 text-brand-700 hover:bg-brand-50 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm flex justify-between items-center relative overflow-hidden dark:text-brand-400 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
              >
                <span>Trimestriel</span>
                <span>
                  {(
                    settings?.subscriptionPrices?.workerQuarterly || 5000
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>
              </button>
              <button
                onClick={() =>
                  handleMockSubscribe(
                    "worker_semiannual",
                    settings?.subscriptionPrices?.workerSemiannual || 8000,
                  )
                }
                className="w-full bg-white dark:bg-slate-900 text-brand-700 hover:bg-brand-50 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm flex justify-between items-center relative overflow-hidden dark:text-brand-400 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
              >
                <span>
                  Semestriel{" "}
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md ml-1">
                    -20%
                  </span>
                </span>
                <span>
                  {(
                    settings?.subscriptionPrices?.workerSemiannual || 8000
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>
              </button>
              <button
                onClick={() =>
                  handleMockSubscribe(
                    "worker_yearly",
                    settings?.subscriptionPrices?.workerYearly || 14000,
                  )
                }
                className="w-full bg-amber-400 text-amber-950 hover:bg-amber-500 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/30 flex justify-between items-center border border-amber-300 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
              >
                <span>
                  Annuel{" "}
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-md ml-1 shadow-sm">
                    -30%
                  </span>
                </span>
                <span>
                  {(
                    settings?.subscriptionPrices?.workerYearly || 14000
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Alert for Workers */}
      {isWorker && !user.photo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-50 border-2 border-brand-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.05)] mb-8"
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-brand-600 dark:text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-900 mb-1 dark:text-blue-700">
                La photo de profil est obligatoire
              </h3>
              <p className="text-brand-700 text-sm dark:text-blue-700">
                Pour gagner la confiance des clients et être visible sur la
                plateforme, veuillez ajouter une photo de profil à votre compte.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenEditProfile}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 shadow-md flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" /> Ajouter une photo
          </button>
        </motion.div>
      )}

      {/* KYC Alert */}
      {user.kycStatus !== "verified" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(245,158,11,0.1)] mb-8"
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-1 dark:text-blue-700">
                {user.kycStatus === "pending"
                  ? "KYC en attente de vérification"
                  : user.kycStatus === "rejected"
                    ? "KYC Rejeté"
                    : "KYC requis pour les retraits !"}
              </h3>
              <p className="text-amber-700 text-sm dark:text-blue-700">
                {user.kycStatus === "pending"
                  ? "Vos documents sont en cours d'analyse par un administrateur."
                  : user.kycStatus === "rejected"
                    ? "Votre demande de vérification a été rejetée. Veuillez soumettre à nouveau vos documents."
                    : "C'est une obligation pour pouvoir retirer vos fonds de votre portefeuille. Faites votre vérification d'identité (KYC)."}
              </p>
            </div>
          </div>

          {user.kycStatus !== "pending" && (
            <button
              onClick={handleCompleteKyc}
              disabled={isKycLoading}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 shadow-md flex items-center justify-center gap-2"
            >
              {isKycLoading ? (
                "Soumission..."
              ) : (
                <>
                  <Camera className="w-5 h-5" /> Soumettre mon KYC
                </>
              )}
            </button>
          )}
          {user.kycStatus === "pending" && (
            <span className="px-4 py-2 bg-amber-100 text-amber-800 font-semibold rounded-xl text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> En cours...
            </span>
          )}
        </motion.div>
      )}



      {/* Main Content Area */}
      <div>
        {/* Activity Summary */}
        {isWorker ? (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Statistiques des sollicitations directes
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setWorkerRequestFilter("direct-all")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "direct-all" ? "bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500 border-brand-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{workerDirectRequests.length}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Toutes les sollicitations", requests: workerDirectRequests }); }} className="mt-4 text-xs sm:text-sm text-brand-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
            
            <button
              onClick={() => setWorkerRequestFilter("direct-accepted")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "direct-accepted" ? "bg-emerald-50/50 dark:bg-emerald-900/10 ring-2 ring-emerald-500 border-emerald-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] border border-[#25D366]/20">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acceptées</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{directAcceptedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Sollicitations acceptées", requests: workerDirectRequests.filter(r => r.status === "accepted") }); }} className="mt-4 text-xs sm:text-sm text-emerald-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
            
            <button
              onClick={() => setWorkerRequestFilter("direct-rejected")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "direct-rejected" ? "bg-red-50/50 dark:bg-red-900/10 ring-2 ring-red-500 border-red-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50">
                    <X className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejetées</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{directRejectedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Sollicitations rejetées", requests: workerDirectRequests.filter(r => r.status === "rejected") }); }} className="mt-4 text-xs sm:text-sm text-red-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
            
            <button
              onClick={() => setWorkerRequestFilter("direct-pending")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "direct-pending" ? "bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500 border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En cours</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{directPendingCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Sollicitations en cours", requests: workerDirectRequests.filter(r => r.status === "pending") }); }} className="mt-4 text-xs sm:text-sm text-amber-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
          </div>

          <div className="mb-4 mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Statistiques des devis (appels d'offres)
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setWorkerRequestFilter("tender-all")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "tender-all" ? "bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500 border-brand-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{workerTenderRequests.length}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Tous les devis", requests: workerTenderRequests }); }} className="mt-4 text-xs sm:text-sm text-brand-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
            <button
              onClick={() => setWorkerRequestFilter("tender-accepted")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "tender-accepted" ? "bg-emerald-50/50 dark:bg-emerald-900/10 ring-2 ring-emerald-500 border-emerald-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] border border-[#25D366]/20">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acceptés</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{tenderAcceptedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis acceptés", requests: workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status === "accepted" && a?.status === "accepted"; }) }); }} className="mt-4 text-xs sm:text-sm text-emerald-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
            
            <button
              onClick={() => setWorkerRequestFilter("tender-rejected")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "tender-rejected" ? "bg-red-50/50 dark:bg-red-900/10 ring-2 ring-red-500 border-red-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50">
                    <X className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejetés</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{tenderRejectedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis rejetés", requests: workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return a?.status === "declined"; }) }); }} className="mt-4 text-xs sm:text-sm text-red-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>

            <button
              onClick={() => setWorkerRequestFilter("tender-pending")}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                workerRequestFilter === "tender-pending" ? "bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500 border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En cours</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{tenderPendingCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis en cours", requests: workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status !== "accepted" && r.status !== "completed" && a?.status !== "declined"; }) }); }} className="mt-4 text-xs sm:text-sm text-amber-600 font-bold flex items-center gap-1 group">
Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
</span>
            </button>
          </div>
        </>
        ) : (
        <div className="mb-8" id="client-stats">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Statistiques des sollicitations directes
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => {
                setClientRequestFilter("direct-all");
                setTimeout(() => document.getElementById('requests-list')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                clientRequestFilter === "direct-all" ? "bg-slate-50 dark:bg-slate-800 ring-2 ring-brand-500 border-brand-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total envoyées</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{clientDirectTotalCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Total envoyées", requests: clientDirectRequests }); }} className="mt-4 text-xs sm:text-sm text-slate-600 font-bold flex items-center gap-1 group">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>
            </button>

            <button
              onClick={() => {
                setClientRequestFilter("direct-accepted");
                setTimeout(() => document.getElementById('requests-list')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                clientRequestFilter === "direct-accepted" ? "bg-emerald-50/50 dark:bg-emerald-900/10 ring-2 ring-emerald-500 border-emerald-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acceptées</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{clientDirectAcceptedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Acceptées", requests: clientDirectRequests.filter(r => r.status === 'accepted' || r.status === 'completed') }); }} className="mt-4 text-xs sm:text-sm text-emerald-600 font-bold flex items-center gap-1 group">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>
            </button>

            <button
              onClick={() => {
                setClientRequestFilter("direct-rejected");
                setTimeout(() => document.getElementById('requests-list')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                clientRequestFilter === "direct-rejected" ? "bg-rose-50/50 dark:bg-rose-900/10 ring-2 ring-rose-500 border-rose-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Refusées</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{clientDirectRejectedCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Refusées", requests: clientDirectRequests.filter(r => r.status === 'rejected') }); }} className="mt-4 text-xs sm:text-sm text-rose-600 font-bold flex items-center gap-1 group">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>
            </button>

            <button
              onClick={() => {
                setClientRequestFilter("direct-pending");
                setTimeout(() => document.getElementById('requests-list')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${
                clientRequestFilter === "direct-pending" ? "bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500 border-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En attente</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{clientDirectPendingCount}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "En attente", requests: clientDirectRequests.filter(r => r.status !== 'accepted' && r.status !== 'completed' && r.status !== 'rejected') }); }} className="mt-4 text-xs sm:text-sm text-amber-600 font-bold flex items-center gap-1 group">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>
            </button>
          </div>

          <div className="mb-4 mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Statistiques des devis (appels d'offres)
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <button onClick={() => navigate('/appels-offres', { state: { activeTab: 'my_tenders' } })} className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95 group">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Demandes publiées</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{clientPublishedTendersCount}</p>
            </div>
            <span onClick={(e) => { e.stopPropagation(); navigate('/appels-offres', { state: { activeTab: 'my_tenders' } }) }} className="mt-4 text-xs sm:text-sm text-brand-600 font-bold flex items-center gap-1 group">
              Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
            </span>
          </button>
          <button onClick={() => {
              setClientRequestFilter('tender-received');
              setTimeout(() => {
                const el = document.getElementById('requests-list');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 100);
            }} className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95 group ${
              clientRequestFilter === 'tender-received' ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500 border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Devis reçus</span>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{clientQuotesReceivedCount}</p>
            </div>
            <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis reçus", requests: clientTenderRequests }); }} className="mt-4 text-xs sm:text-sm text-blue-600 font-bold flex items-center gap-1 group">
              Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
            </span>
          </button>
          <button onClick={() => {
              setClientRequestFilter('tender-accepted');
              setTimeout(() => {
                const el = document.getElementById('requests-list');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 100);
            }} className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md hover:bg-emerald-100 hover:border-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:border-emerald-800 cursor-pointer active:scale-95 group ${
              clientRequestFilter === 'tender-accepted' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 ring-2 ring-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50'
            }`}>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Devis validés</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{clientQuotesAcceptedCount}</p>
            </div>
            <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis validés", requests: clientTenderRequests.filter(r => r.status === 'accepted' || r.status === 'completed') }); }} className="mt-4 text-xs sm:text-sm text-emerald-600 font-bold flex items-center gap-1 group">
              Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
            </span>
          </button>
          <button onClick={() => {
              setClientRequestFilter('tender-consulted');
              setTimeout(() => {
                const el = document.getElementById('requests-list');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 100);
            }} className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 cursor-pointer active:scale-95 group ${
              clientRequestFilter === 'tender-consulted' ? 'bg-slate-50 dark:bg-slate-800 ring-2 ring-slate-500 border-slate-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
             <div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Devis consultés</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">{clientQuotesConsultedCount}</p>
            </div>
            <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis consultés", requests: clientTenderRequests.filter(r => !r.clientHasUnread && (!r.clientUnreadCount || r.clientUnreadCount === 0)) }); }} className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-200 font-bold flex items-center gap-1 group">
              Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
            </span>
          </button>
          <button onClick={() => {
              setClientRequestFilter('tender-unconsulted');
              setTimeout(() => {
                const el = document.getElementById('requests-list');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 100);
            }} className={`text-left border rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden transition-all duration-200 transform sm:hover:-translate-y-1 sm:hover:scale-[1.02] hover:shadow-md hover:bg-rose-200 hover:border-rose-400 dark:hover:bg-rose-900/40 dark:hover:border-rose-800 cursor-pointer active:scale-95 group ${
              clientRequestFilter === 'tender-unconsulted' ? 'bg-rose-100/50 dark:bg-rose-900/20 ring-2 ring-rose-500 border-rose-500' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50'
            }`}>
            <div className="relative z-10">
              <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Devis non consultés</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{clientQuotesUnconsultedCount}</p>
              {clientQuotesUnconsultedCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-ping"
                ></motion.span>
              )}
            </div>
            <span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "Devis non consultés", requests: clientTenderRequests.filter(r => r.clientHasUnread || r.clientUnreadCount > 0) }); }} className="mt-4 text-xs sm:text-sm text-rose-600 font-bold flex items-center gap-1 relative z-10 group">
              Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
            </span>
          </button>
        </div>
        </div>
        )}


      </div>



      {/* Affiliation & Wallet */}
      <div className="bg-gradient-to-br from-brand-50/80 to-brand-100/50 dark:from-slate-800 dark:to-slate-900 p-5 sm:p-8 rounded-3xl shadow-sm border border-brand-200 dark:border-brand-900/50 mb-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center overflow-hidden">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 dark:bg-brand-900/50 p-2.5 rounded-xl">
              <Gift className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h4 className="font-display font-bold text-lg min-[400px]:text-xl sm:text-2xl shrink-0 text-brand-900 dark:text-white">
              Programme d'Affiliation ACC
            </h4>
          </div>

          <p className="text-brand-800 leading-relaxed max-w-xl dark:text-yellow-400">
            Partagez ACC et générez des revenus passifs récurrents{" "}
            <span className="font-bold">à vie</span> !
            <br className="hidden lg:block" />
            Vous êtes rémunéré automatiquement sur{" "}
            <span className="font-bold text-brand-900 dark:text-yellow-400">
              2 niveaux
            </span>{" "}
            à chaque fois que vos invités ou leurs filleuls s'abonnent ou se
            réabonnent :
          </p>

          {user.role !== "admin" &&
            (!user.subscription?.activeUntil ||
              new Date(user.subscription.activeUntil) < new Date()) && (
              <div className="bg-amber-100/80 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-blue-400 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Vous n'avez pas d'abonnement actif. Vos récompenses sont
                  gelées et vos futures commissions sont suspendues jusqu'au
                  renouvellement de votre abonnement. Le retrait minimum est de{" "}
                  <strong>1 000 FCFA</strong>.
                </p>
              </div>
            )}

          <div className="mt-8 border-t border-brand-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">
              Statistiques d'Affiliation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/60 dark:bg-slate-800/60 border border-brand-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Filleuls Directs (N1)
                </span>
                <span className="text-2xl font-black text-brand-600 dark:text-white">
                  {user.referralStats?.l1Count || 0}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 border border-brand-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Sous-Filleuls (N2)
                </span>
                <span className="text-2xl font-black text-brand-600 dark:text-white">
                  {user.referralStats?.l2Count || 0}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 border border-emerald-200/50 dark:border-emerald-900 px-4 py-3 rounded-2xl flex flex-col items-center justify-center col-span-2 row-span-2 gap-2">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 text-center">
                  Gains d'affiliation totaux
                </span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 text-center">
                  {(user.referralStats?.totalRevenue || 0).toLocaleString()}{" "}
                  <span className="text-sm">FCFA</span>
                </span>

                <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/50">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">
                      Total retiré
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {(
                        user.referralStats?.transferredRevenue || 0
                      ).toLocaleString()}{" "}
                      FCFA
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">
                      Total restant
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {(
                        (user.referralStats?.totalRevenue || 0) -
                        (user.referralStats?.transferredRevenue || 0)
                      ).toLocaleString()}{" "}
                      FCFA
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 border border-brand-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Gains N1
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-gray-200">
                  {(user.referralStats?.l1Revenue || 0).toLocaleString()}{" "}
                  <span className="text-xs text-slate-500">FCFA</span>
                </span>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 border border-brand-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Gains N2
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-gray-200">
                  {(user.referralStats?.l2Revenue || 0).toLocaleString()}{" "}
                  <span className="text-xs text-slate-500">FCFA</span>
                </span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
              Plan de Rémunération
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="bg-white/40 dark:bg-slate-800/40 border border-brand-200/30 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col border border-brand-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Niveau 1
                </span>
                <span className="text-xl font-black text-brand-600 dark:text-white">
                  25%{" "}
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    /abo à vie
                  </span>
                </span>
              </li>
              <li className="bg-white/40 dark:bg-slate-800/40 border border-brand-200/30 dark:border-slate-700 px-4 py-3 rounded-2xl flex flex-col border border-brand-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Niveau 2
                </span>
                <span className="text-xl font-black text-brand-600 dark:text-white">
                  10%{" "}
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    /abo à vie
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-brand-200 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-8">
          <div className="text-left">
            <span className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Solde Portefeuille
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {computedWalletBalance
                    ? computedWalletBalance.toLocaleString()
                    : 0}{" "}
                  <span className="text-lg sm:text-xl font-medium text-slate-500">
                    FCFA
                  </span>
                </span>
                <button
                  onClick={() => {
                    if (user.kycStatus !== "verified") {
                      toast.error(
                        "Veuillez effectuer votre KYC (Vérification d'identité) pour pouvoir effectuer un retrait.",
                      );
                      return;
                    }
                    setShowWithdrawModal(true);
                  }}
                  disabled={
                    !computedWalletBalance || computedWalletBalance < 1000
                  }
                  className="bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition shrink-0"
                >
                  Retirer
                </button>
                <button
                  type="button"
                  onClick={() => fetchTransferHistory("affiliate_all")}
                  className="bg-slate-100 text-slate-700 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition shrink-0"
                >
                  Historique
                </button>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Minimum de retrait : 1 000 FCFA
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Votre Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold text-brand-700 tracking-wider dark:text-brand-400 flex items-center">
                  {user.referralCode || "----"}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/30 dark:hover:bg-brand-800/50 text-brand-700 px-3 rounded-xl flex items-center justify-center transition dark:text-brand-400"
                  title="Copier le code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShareCode}
                  className="bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/30 dark:hover:bg-brand-800/50 text-brand-700 px-3 rounded-xl flex items-center justify-center transition dark:text-brand-400"
                  title="Partager le code"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Lien d'invitation
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-brand-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 font-mono outline-none truncate"
                />
                <button
                  onClick={handleCopyReferral}
                  className="bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/30 dark:hover:bg-brand-800/50 text-brand-700 px-3 rounded-xl flex items-center justify-center transition dark:text-brand-400"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShareReferral}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-3 rounded-xl flex items-center justify-center transition shadow-sm shadow-brand-600/20"
                  title="Partager"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Danger Zone */}
        <div className="mt-16 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-red-700 dark:text-red-400 mb-1">
                Zone de danger
              </h4>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 max-w-xl">
                La suppression de votre compte est irréversible. Toutes vos
                données, vos demandes, et votre historique seront définitivement
                supprimés de nos serveurs.
              </p>
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="shrink-0 w-full sm:w-auto bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 font-bold px-6 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm disabled:opacity-50"
          >
            {isDeletingAccount
              ? "Suppression en cours..."
              : "Supprimer mon compte"}
          </button>
        </div>

      {/* Details Modal */}
      {selectedRequest &&
        (() => {
          // Safe access helpers to avoid runtime crashes
          const getParticipantName = (req: any, clientSide: boolean) => {
            if (clientSide) {
              if (
                req.clientId &&
                req.clientId.entityType === "company" &&
                req.clientId.companyName
              )
                return req.clientId.companyName;
              if (req.clientId && req.clientId.name) return req.clientId.name;
              if (req.guestContact) return `Invité (${req.guestContact})`;
              return "Client Inconnu";
            } else {
              if (
                req.workerId &&
                req.workerId.entityType === "company" &&
                req.workerId.companyName
              )
                return req.workerId.companyName;
              if (req.workerId && req.workerId.name) return req.workerId.name;
              return "Artisan Inconnu";
            }
          };
          const safeDate = (d: any) => {
            if (!d) return "";
            try {
              return new Date(d).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch (e) {
              return "";
            }
          };

          const amIWorkerForThisReq = String(selectedRequest.workerId?._id || selectedRequest.workerId) === String(user?._id);

          const otherName = amIWorkerForThisReq
            ? getParticipantName(selectedRequest, true)
            : getParticipantName(selectedRequest, false);
          const otherInitial = otherName.charAt(0).toUpperCase();

          const otherId = amIWorkerForThisReq 
             ? (selectedRequest.clientId?._id || selectedRequest.clientId || null)
             : (selectedRequest.workerId?._id || selectedRequest.workerId || null);
          const isOnline = otherId ? onlineUsers.has(otherId.toString()) : false;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-900/40 sm:bg-slate-900/60 sm:backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full h-full sm:h-[90vh] sm:max-w-2xl md:max-w-3xl bg-[#efeae2] dark:bg-[#0b141a] sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 md:gap-4 bg-white dark:bg-[#202c33] px-4 py-3 shadow-sm z-20">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white rounded-full transition-colors flex sm:hidden"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold shrink-0 text-lg uppercase">
                      {otherInitial}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#202c33] rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedRequest.tenderId ? (
                      <button
                        onClick={() => {
                          const stateObj = user?.role === "worker"
                            ? { activeTab: "all", scrollToTender: selectedRequest.tenderId._id || selectedRequest.tenderId }
                            : { activeTab: "my_tenders", scrollToTender: selectedRequest.tenderId._id || selectedRequest.tenderId };
                          navigate("/appels-offres", { state: stateObj });
                        }}
                        className="font-bold text-slate-900 dark:text-[#e9edef] text-base leading-tight truncate hover:underline hover:text-brand-600 dark:hover:text-brand-400 max-w-full block text-left"
                        title="Voir l'appel d'offres"
                      >
                        Réf: {selectedRequest.tenderId.reference || (selectedRequest.tenderId._id || "").substring((selectedRequest.tenderId._id || "").length - 6).toUpperCase()} - {otherName}
                      </button>
                    ) : (
                      <p className="font-bold text-slate-900 dark:text-[#e9edef] text-base leading-tight truncate">
                        Réf: {(selectedRequest._id || "").substring((selectedRequest._id || "").length - 6).toUpperCase()} - {otherName}
                      </p>
                    )}
                    <p className={`text-xs font-medium leading-tight mt-0.5 ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {isOnline ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#aebac1] dark:hover:text-[#e9edef] p-2 rounded-full hidden sm:flex transition-colors"
                    title="Fermer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Chat Body */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#efeae2] dark:bg-[#0b141a]"
                >
                  {/* WhatsApp background pattern simulation */}
                  <div
                    className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "url('https://camo.githubusercontent.com/92ebacfb0f681a2da38e8ec88939c4c4dc8c9a3bf00fba681a7ce74fa49320b9/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')",
                      backgroundSize: "contain",
                      backgroundRepeat: "repeat",
                    }}
                  />

                  <div className="relative z-10 flex flex-col space-y-4 max-w-4xl mx-auto w-full">
                    {/* Information Callout */}
                    <div className="flex justify-center">
                      <div className="bg-[#ffeecd] dark:bg-[#182229] border border-[#ffdd99] dark:border-[#202c33] text-[#543b16] dark:text-[#d1d7db] text-xs px-4 py-2 rounded-xl max-w-sm text-center shadow-sm">
                        <MapPin className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                        <span className="font-medium">
                          {selectedRequest.location ||
                            "Localisation non spécifiée"}
                        </span>
                        {!isWorker && (
                          <div className="mt-2 text-center text-[10px]">
                            <button onClick={() => window.print()} className="bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 hover:bg-brand-200 transition">
                               <Download className="w-3 h-3" /> Télécharger en PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* The Original Request */}
                    <div
                      className={`flex flex-col mb-4 ${!amIWorkerForThisReq ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[75%] p-2 rounded-2xl shadow-sm pb-1 flex flex-col ${!amIWorkerForThisReq ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] rounded-tr-none" : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-none"}`}
                      >
                        <div className="border-b border-black/5 dark:border-white/5 pb-1 mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                            Demande initiale
                          </span>
                        </div>

                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap px-1 pt-1">
                          {selectedRequest.serviceDetails || "Aucun détail"}
                        </p>

                        {selectedRequest.audioData && (
                          <div className="mt-2 w-[250px] min-w-[250px] max-w-[280px] rounded-full overflow-hidden">
                            <audio
                              src={selectedRequest.audioData}
                              controls
                              controlsList="nodownload"
                              className="w-full min-w-[250px] h-[54px]"
                            />
                          </div>
                        )}

                        {selectedRequest.attachmentUrl && (
                          <div className="mt-2 text-sm font-semibold underline">
                            {String(selectedRequest.attachmentUrl).startsWith(
                              "data:image",
                            ) ||
                            String(selectedRequest.attachmentUrl).match(
                              /\.(jpeg|jpg|gif|png)$/i,
                            ) ? (
                              <img
                                src={selectedRequest.attachmentUrl}
                                alt="Pièce jointe"
                                className="mt-2 w-full max-w-xs rounded-xl border border-black/10 dark:border-white/10 object-cover"
                              />
                            ) : (
                              <a
                                href={selectedRequest.attachmentUrl}
                                download="piece_jointe.pdf"
                                className="flex items-center gap-1 opacity-90 hover:opacity-100"
                              >
                                <Paperclip className="w-4 h-4" /> Document joint
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end items-center gap-1 mt-1 opacity-60 px-1">
                          <span className="text-[10px]">
                            {safeDate(selectedRequest.date)}
                          </span>
                          {!isWorker && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>

                    {/* Responses Map */}
                    {(selectedRequest.responses || [])
                      .filter(
                        (r: any) => 
                          !(r.deletedFor || []).includes(user?._id) &&
                          (!r.text || (!r.text.includes("[[SYS_OFFER_PROPOSAL]]"))),
                      )
                      .map((res: any, idx: number) => {
                        const isMe = String(res.senderId) === String(user?._id);
                        const isDeletedForEveryone = res.deletedForEveryone;
                        
                        if (res.text === '[[SYS_DIRECT_AGREEMENT_REACHED]]' || res.text === '[[SYS_OFFER_CONFIRMED]]') {
                          return (
                             <div key={idx} className="flex justify-center my-4 w-full">
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center shadow-sm max-w-sm w-full animate-pulse transition-all">
                                  <div className="flex justify-center mb-2">
                                     <div className="bg-emerald-100 dark:bg-emerald-800 p-2 rounded-full">
                                        <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                     </div>
                                  </div>
                                  <span className="font-bold text-lg block mb-1">Félicitations !</span>
                                  <span className="text-sm border-t border-emerald-200 dark:border-emerald-800/50 pt-2 mt-2 inline-block w-full">
                                    L'accord a été conclu. La prestation est validée de part et d'autre.
                                  </span>
                                </div>
                             </div>
                          );
                        }

                        if (res.text === '[[SYS_OFFER_REFUSED]]' || res.text === '[[SYS_DIRECT_AGREEMENT_DECLINED]]') {
                          return (
                             <div key={idx} className="flex justify-center my-4 w-full">
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl text-center shadow-sm max-w-sm w-full transition-all">
                                  <div className="flex justify-center mb-2">
                                     <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                                        <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                                     </div>
                                  </div>
                                  <span className="font-bold text-lg block mb-1">Offre déclinée</span>
                                  <span className="text-sm border-t border-red-200 dark:border-red-800/50 pt-2 mt-2 inline-block w-full">
                                    L'accord a été décliné par l'une des parties. Le statut de cette demande a été mis à jour.
                                  </span>
                                </div>
                             </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} relative group`}
                          >
                            <div
                              className={`max-w-[90%] md:max-w-[75%] p-2 rounded-2xl shadow-sm pb-1 flex flex-col ${isMe ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] rounded-tr-none" : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-none"} relative`}
                            >
                              {isMe && !isDeletedForEveryone && (
                                <button
                                  onClick={() =>
                                    setDeleteMenuOpen(
                                      deleteMenuOpen?.resId === res._id
                                        ? null
                                        : {
                                            reqId: selectedRequest._id,
                                            resId: res._id,
                                          },
                                    )
                                  }
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                                >
                                  <ChevronDown className="w-4 h-4 text-slate-500" />
                                </button>
                              )}
                              {deleteMenuOpen?.resId === res._id && (
                                <div className="absolute top-8 right-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 min-w-[180px]">
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setDeleteMenuOpen(null)}
                                  />
                                  <div className="relative z-50">
                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(
                                          deleteMenuOpen.reqId,
                                          deleteMenuOpen.resId,
                                          false,
                                        )
                                      }
                                      disabled={isDeletingMessage}
                                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
                                    >
                                      Supprimer pour moi
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(
                                          deleteMenuOpen.reqId,
                                          deleteMenuOpen.resId,
                                          true,
                                        )
                                      }
                                      disabled={isDeletingMessage}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
                                    >
                                      Supprimer pour tous
                                    </button>
                                  </div>
                                </div>
                              )}

                              {isDeletedForEveryone ? (
                                <div className="flex items-center gap-1.5 px-1 py-1 italic opacity-60 text-[14px]">
                                  <Ban className="w-4 h-4" />{" "}
                                  <span>Ce message a été supprimé</span>
                                </div>
                              ) : (
                                <>
                                  {res.text && (
                                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap px-1 pt-1 pr-4">
                                      {res.text}
                                    </p>
                                  )}

                                  {res.audioData && (
                                    <div className="mt-2 w-[250px] min-w-[250px] max-w-[280px] rounded-full overflow-hidden">
                                      <audio
                                        src={res.audioData}
                                        controls
                                        controlsList="nodownload"
                                        className="w-full min-w-[250px] h-[54px]"
                                      />
                                    </div>
                                  )}

                                  {res.attachmentUrl && (
                                    <div className="mt-2 text-sm font-semibold underline">
                                      {String(res.attachmentUrl).startsWith(
                                        "data:image",
                                      ) ||
                                      String(res.attachmentUrl).match(
                                        /\.(jpeg|jpg|gif|png)$/i,
                                      ) ? (
                                        <img
                                          src={res.attachmentUrl}
                                          alt="Jointe"
                                          className="mt-1 w-full max-w-xs rounded-xl border border-black/10 dark:border-white/10 object-cover"
                                        />
                                      ) : (
                                        <a
                                          href={res.attachmentUrl}
                                          download="piece_jointe.pdf"
                                          className="flex items-center gap-1 opacity-90 hover:opacity-100"
                                        >
                                          <Paperclip className="w-4 h-4" />{" "}
                                          Document joint
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              <div className="flex justify-end items-center gap-1 mt-1 opacity-60 px-1">
                                <span className="text-[10px]">
                                  {safeDate(
                                    res.createdAt || selectedRequest.date,
                                  )}
                                </span>
                                {isMe && !isDeletedForEveryone && (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Actions / Subscriptions Blocks */}
                    {isWorker &&
                      (!user?.subscription?.activeUntil ||
                        new Date(user.subscription.activeUntil) <
                          new Date()) && (
                        <div className="flex justify-center mt-6 mb-2">
                          <div className="bg-[#ffeecd] dark:bg-[#202c33] p-4 rounded-xl border border-[#ffdd99] dark:border-[#2a3942] w-full max-w-md shadow-sm">
                            <h4 className="font-bold text-[#543b16] dark:text-[#d1d7db] mb-2 flex justify-center gap-2 text-[15px]">
                              <AlertCircle className="w-4 h-4" /> Accès
                              restreint
                            </h4>
                            <p className="text-[13px] text-[#543b16]/80 dark:text-[#d1d7db]/80 mb-4 text-center">
                              Renouvelez votre abonnement Pro pour débloquer
                              toutes les fonctionnalités.
                            </p>
                            <button
                              onClick={() =>
                                handleMockSubscribe(
                                  "worker_quarterly",
                                  settings?.subscriptionPrices
                                    ?.workerQuarterly || 5000,
                                )
                              }
                              className="w-full bg-[#00a884] hover:bg-[#029072] text-white font-bold py-3 rounded-xl transition text-[15px]"
                            >
                              S'abonner (
                              {(
                                settings?.subscriptionPrices?.workerQuarterly ||
                                5000
                              ).toLocaleString("fr-FR")}{" "}
                              FCFA)
                            </button>
                          </div>
                        </div>
                      )}

                    <div className="flex flex-col items-center justify-center gap-4 mt-4 mb-6">
                      {selectedRequest.tenderId ? (
                        <>
                          {/* Tender Specific Logic */}
                          {selectedRequest.status === "pending" && isWorker && (
                            <button
                              onClick={() => {
                                navigate("/appels-offres", { state: { activeTab: "all", openQuoteForTender: selectedRequest.tenderId._id || selectedRequest.tenderId } });
                              }}
                              className="bg-brand-600 text-white font-bold px-6 py-3 rounded-full hover:bg-brand-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                            >
                              <Check className="w-5 h-5 flex-shrink-0" />
                              <span>Proposer un devis</span>
                            </button>
                          )}
                          {!isWorker && selectedRequest.status === "pending" && selectedRequest.responses?.some((r: any) => String(r.senderId?._id || r.senderId) === String(selectedRequest.workerId?._id || selectedRequest.workerId)) && (
                            <div className="flex gap-4">
                              <button
                                onClick={() => acceptOffer(selectedRequest)}
                                disabled={isProcessingOffer}
                                className="bg-[#00a884] text-white font-bold px-6 py-3 rounded-full hover:bg-[#029072] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                              >
                                {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 flex-shrink-0" />}
                                <span>Accepter</span>
                              </button>
                              <button
                                onClick={() => refuseOffer(selectedRequest)}
                                disabled={isProcessingOffer}
                                className="bg-red-500 text-white font-bold px-6 py-3 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                              >
                                {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 flex-shrink-0" />}
                                <span>Décliner</span>
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Direct Solicitation Logic */}
                          {selectedRequest.status === "pending" && (
                            (!isAuthor(selectedRequest) || selectedRequest.responses?.some((r: any) => String(r.senderId?._id || r.senderId) !== String(user?._id)))
                          ) && !selectedRequest.firstAcceptorId && (
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleDirectAgreement(selectedRequest, 'accept')}
                                disabled={isProcessingOffer}
                                className="bg-[#00a884] text-white font-bold px-6 py-3 rounded-full hover:bg-[#029072] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                              >
                                {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 flex-shrink-0" />}
                                <span>Accepter</span>
                              </button>
                              <button
                                onClick={() => handleDirectAgreement(selectedRequest, 'decline')}
                                disabled={isProcessingOffer}
                                className="bg-red-500 text-white font-bold px-6 py-3 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                              >
                                {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 flex-shrink-0" />}
                                <span>Décliner</span>
                              </button>
                            </div>
                          )}
                          {selectedRequest.status === "pending" && selectedRequest.firstAcceptorId && selectedRequest.firstAcceptorId === user?._id && (
                             <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg my-4 text-center font-medium w-full shadow-sm max-w-xl mx-auto">
                                Votre acceptation de l'offre a été envoyée à l'interlocuteur. Vous recevrez ici sa confirmation.
                             </div>
                          )}
                          {selectedRequest.status === "pending" && selectedRequest.firstAcceptorId && selectedRequest.firstAcceptorId !== user?._id && (
                             <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-lg my-4 flex flex-col items-center text-center w-full shadow-sm max-w-xl mx-auto">
                                <span className="font-bold text-xl mb-2 text-emerald-900">Félicitations !</span>
                                <span className="mb-5 text-sm">L'offre a été acceptée par votre interlocuteur. Cliquez sur "Accepter" pour valider l'accord, ou "Décliner" pour annuler et continuer à discuter.</span>
                                <div className="flex gap-4">
                                   <button onClick={() => handleDirectAgreement(selectedRequest, 'accept')} disabled={isProcessingOffer} className="bg-[#00a884] shadow-md text-white px-6 py-3 rounded-full font-bold hover:bg-[#029072] transition-colors flex items-center gap-2">
                                      {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                      Accepter
                                   </button>
                                   <button onClick={() => handleDirectAgreement(selectedRequest, 'decline')} disabled={isProcessingOffer} className="bg-white shadow-md border border-slate-200 text-red-600 px-6 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                      {isProcessingOffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                      Décliner
                                   </button>
                                </div>
                             </div>
                          )}
                        </>
                      )}
                      
                      {(selectedRequest.status === "completed" || selectedRequest.status === "accepted") && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                          <a
                            href={`tel:${isWorker ? selectedRequest.clientId?.phone : selectedRequest.workerId?.phone}`}
                            className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold px-6 py-3 rounded-full hover:bg-brand-200 dark:hover:bg-brand-900/50 active:scale-95 transition-all shadow-sm border border-brand-200 dark:border-brand-800 flex items-center justify-center gap-2 text-[14px]"
                          >
                            <Phone className="w-5 h-5 flex-shrink-0" />
                            <span>Appeler {isWorker ? "le client" : "l'artisan"}</span>
                          </a>

                          {!isWorker && (
                            <button
                              onClick={() => setShowReviewModal(true)}
                              className="bg-amber-500 text-white font-bold px-6 py-3 rounded-full hover:bg-amber-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-[14px]"
                            >
                              <Star className="w-5 h-5 fill-current flex-shrink-0" />
                              <span>Noter la prestation</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input Form Footer WhatsApp Style */}
                {(!selectedRequest.tenderId ? (
                   selectedRequest.status === "pending" && !selectedRequest.firstAcceptorId
                ) : (
                  selectedRequest.status === "pending"
                )) && (
                  <form
                    onSubmit={handleSubmitReply}
                    className="bg-[#f0f2f5] dark:bg-[#202c33] px-2 py-2 pb-safe sm:pb-3 sm:px-4 sm:py-3 w-full flex flex-col gap-2 relative z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                  >
                    {/* Previews */}
                    {replyAttachmentUrl && (
                      <div className="flex items-center gap-2 bg-white dark:bg-[#111b21] p-2 rounded-xl shadow-sm border border-slate-200 dark:border-[#2a3942] w-fit">
                        <div className="text-xs font-bold text-slate-700 dark:text-[#d1d7db] flex items-center gap-2">
                          <Paperclip className="w-4 h-4" /> Fichier joint
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyAttachmentUrl(null)}
                          className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {replyAudioData && replyAudioUrl && (
                      <div className="flex items-center gap-2 bg-white dark:bg-[#111b21] p-2 rounded-xl shadow-sm border border-slate-200 dark:border-[#2a3942]">
                        <audio
                          src={replyAudioUrl}
                          controls
                          controlsList="nodownload"
                          className="w-[250px] min-w-[250px] h-[54px]"
                        />
                        <button
                          type="button"
                          onClick={clearRecordingReply}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-end gap-2 w-full max-w-4xl mx-auto">
                      <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-3xl flex items-end shadow-sm border border-transparent dark:border-slate-700/50 overflow-hidden">
                        {isRecordingReply ? (
                          <div className="w-full h-12 sm:h-[50px] flex items-center justify-between px-4" style={{ minHeight: "48px" }}>
                             <div className="flex items-center gap-2 text-red-500 animate-pulse font-medium">
                               <div className="w-2 h-2 rounded-full bg-red-500" />
                               Enregistrement...
                             </div>
                          </div>
                        ) : (
                          <>
                            <label className="p-3 sm:p-3.5 text-slate-500 hover:text-slate-700 dark:text-[#8696a0] dark:hover:text-[#d1d7db] cursor-pointer rounded-l-3xl transition flex-shrink-0">
                              <Paperclip className="w-6 h-6" />
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleReplyFileUpload}
                              />
                            </label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Message"
                              className="flex-1 bg-transparent py-3 sm:py-3.5 px-1 max-h-32 resize-none outline-none text-[#111b21] dark:text-[#e9edef] text-[16px] placeholder-slate-400 dark:placeholder-[#8696a0]"
                              rows={1}
                              style={{ minHeight: "48px" }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (
                                    replyText.trim() ||
                                    replyAudioData ||
                                    replyAttachmentUrl
                                  )
                                    handleSubmitReply(e as any);
                                }
                              }}
                            />
                            <div className="p-2 flex-shrink-0">
                              {/* spacing for symmetric look */}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex-shrink-0 mb-[2px]">
                        {replyText.trim() ||
                        replyAudioData ||
                        replyAttachmentUrl ? (
                          <button
                            type="submit"
                            disabled={isSubmittingReply}
                            className="w-12 h-12 bg-[#00a884] items-center justify-center rounded-full text-white hover:bg-[#029072] active:scale-95 shadow-md transition-all flex flex-shrink-0"
                          >
                            {isSubmittingReply ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <Send className="w-5 h-5 ml-1" />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              isRecordingReply
                                ? handleStopRecordingReply
                                : handleStartRecordingReply
                            }
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-md active:scale-95 transition-all flex-shrink-0 ${isRecordingReply ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#029072]"}`}
                          >
                            {isRecordingReply ? (
                              <Square className="w-5 h-5 fill-current" />
                            ) : (
                              <Mic className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          );
        })()}

      {/* 2FA Choice Modal */}
      <AnimatePresence>
        {showPassword2FAChoiceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Méthode de vérification
              </h3>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Pour des raisons de sécurité, veuillez indiquer où vous
                souhaitez recevoir le code de confirmation.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { id: "email", label: "Email", icon: Mail },
                  { id: "phone", label: "SMS", icon: Phone },
                  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelected2FAMethod(method.id as any)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border ${selected2FAMethod === method.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"} transition-all`}
                  >
                    <method.icon
                      className={`w-5 h-5 ${selected2FAMethod === method.id ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`}
                    />
                    <span
                      className={`font-semibold ${selected2FAMethod === method.id ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {method.label}
                    </span>
                    {selected2FAMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-brand-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowPassword2FAChoiceModal(false)}
                  className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword2FAChoiceModal(false);
                    setShowPasswordOtpModal(true);
                    setToastMessage(
                      `Un code a été envoyé via ${selected2FAMethod === "email" ? "Email" : selected2FAMethod === "phone" ? "SMS" : "WhatsApp"}.`,
                    );
                    setTimeout(() => setToastMessage(null), 5000);
                  }}
                  className="w-full sm:w-1/2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password OTP Modal */}
      <AnimatePresence>
        {showPasswordOtpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Action de sécurité requise
              </h3>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Veuillez entrer le code de confirmation que nous avons envoyé à
                vos contacts enregistrés.
              </p>

              <form onSubmit={handleVerifyPasswordOtp} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={passwordOtpCode}
                    onChange={(e) => setPasswordOtpCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition-colors outline-none text-center font-mono text-2xl tracking-widest h-14"
                    maxLength={6}
                    placeholder="1234"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordOtpModal(false);
                      setPasswordOtpCode("");
                    }}
                    className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={passwordOtpCode.length < 4}
                    className="w-full sm:w-1/2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Vérifier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generate Confirmation Modal */}
      <AnimatePresence>
        {aiConfirmType && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Wand2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Génération avec l'IA
              </h3>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                L'IA va générer une proposition de description basée sur votre
                profil.
                <br />
                <br />
                Ceci est une base que vous devriez ajuster à votre guise :
                l'objectif étant de mettre vos talents sur la plateforme pour
                attirer un maximum de clientèle.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setAiConfirmType(null)}
                  className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => executeGenerateDescription(aiConfirmType)}
                  className="w-full sm:w-1/2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Continuer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}






      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {isSubmittingProfile || profileSaved ? (
                <ProgressConfirm
                  isSubmitting={isSubmittingProfile}
                  isSuccess={profileSaved}
                  progress={submitProfileProgress}
                  successMessage={<>Profil mis à jour avec succès !</>}
                  onClose={() => setIsEditProfileOpen(false)}
                />
              ) : (
                <>
                  <button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="absolute top-6 right-6 z-10 text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 pr-10 sm:pr-0">
                    <div className="p-2 bg-brand-50 rounded-xl shrink-0">
                      <Edit3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                      Modifier mon profil
                    </h3>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={editFormData.name || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Email
                        </label>
                        {!isEditingEmail ? (
                          <div className="flex items-center justify-between px-4 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-900 dark:text-white font-medium break-all">
                              {user.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEditingEmail(true)}
                              className="p-1.5 -mr-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Modifier mon email"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Nouvel email
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingEmail(false);
                                  setEditFormData({
                                    ...editFormData,
                                    email: user.email,
                                  });
                                }}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                            <input
                              type="email"
                              value={editFormData.email || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition-colors outline-none h-12"
                              placeholder="Entrez votre nouvel email..."
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Mot de passe
                        </label>
                        {!isEditingPassword ? (
                          <div className="flex items-center justify-between px-4 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span
                              className={`text-slate-900 dark:text-white font-medium text-base mt-1 flex items-center leading-none ${!showDefaultPassword ? "tracking-widest" : ""}`}
                            >
                              {showDefaultPassword
                                ? (user as any)?.password || "Non défini"
                                : "••••••••"}
                            </span>
                            <div className="flex items-center gap-1 -mr-1.5">
                              <button
                                type="button"
                                onClick={handleTogglePasswordVisibility}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg"
                                title="Afficher/Masquer le mot de passe"
                              >
                                {showDefaultPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingPassword(true)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Modifier le mot de passe"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Modifier le mot de passe
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingPassword(false);
                                  setEditFormData({
                                    ...editFormData,
                                    currentPassword: "",
                                    newPassword: "",
                                    newPasswordConfirm: "",
                                  });
                                }}
                                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Nouveau Mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  value={editFormData.newPassword || ""}
                                  autoComplete="new-password"
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      newPassword: e.target.value,
                                    })
                                  }
                                  className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition-colors outline-none h-12"
                                  placeholder="Nouveau mot de passe..."
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Confirmer le nouveau Mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={
                                    showNewPasswordConfirm ? "text" : "password"
                                  }
                                  value={editFormData.newPasswordConfirm || ""}
                                  autoComplete="new-password"
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      newPasswordConfirm: e.target.value,
                                    })
                                  }
                                  className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition-colors outline-none h-12"
                                  placeholder="Confirmer le nouveau mot de passe..."
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowNewPasswordConfirm(
                                      !showNewPasswordConfirm,
                                    )
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                  {showNewPasswordConfirm ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Nom de l'entreprise (optionnel)
                        </label>
                        <input
                          type="text"
                          value={editFormData.companyName || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              companyName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12"
                        />
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Pays
                        </label>
                        <CustomSelect
                          value={editFormData.country}
                          onChange={(val) => {
                            const prefix =
                              PHONE_PREFIXES.find((p) => p.country === val)
                                ?.code || editFormData.phonePrefix;
                            setEditFormData({
                              ...editFormData,
                              country: val,
                              location: "",
                              phonePrefix: prefix,
                              whatsappPrefix: prefix,
                            });
                          }}
                          options={COUNTRIES.map((c) => ({
                            label: (
                              <span className="flex items-center gap-2">
                                <img
                                  src={COUNTRY_FLAGS[c]}
                                  alt={c}
                                  className="w-5 h-auto rounded-[2px]"
                                />{" "}
                                {c}
                              </span>
                            ),
                            value: c,
                          }))}
                          placeholder="Sélectionnez un pays"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Zone d'intervention
                        </label>
                        <CustomSelect
                          value={editFormData.location}
                          onChange={(val) =>
                            setEditFormData({
                              ...editFormData,
                              location: val,
                            })
                          }
                          options={(
                            CITIES_BY_COUNTRY[editFormData.country] || []
                          ).map((loc) => ({
                            label: loc,
                            value: loc,
                          }))}
                          placeholder="Sélectionnez une zone"
                          disabled={!editFormData.country}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Numéro de téléphone
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium min-w-[80px]">
                            {editFormData.phonePrefix || "+..."}
                          </div>
                          <input
                            type="tel"
                            value={editFormData.phoneNumber}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                phoneNumber: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12 flex-1"
                            placeholder="01 02 03 04 05"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={editFormData.sameAsPhone}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                sameAsPhone: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 focus:ring-2 border-slate-300"
                          />
                          Mon numéro WhatsApp est identique
                        </label>

                        {!editFormData.sameAsPhone && (
                          <div className="mt-3">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              Numéro WhatsApp{" "}
                              <span className="text-emerald-500 text-xs">
                                Requis
                              </span>
                            </label>
                            <div className="flex gap-2">
                              <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium min-w-[80px]">
                                {editFormData.whatsappPrefix || "+..."}
                              </div>
                              <input
                                type="tel"
                                value={editFormData.whatsappNumber}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    whatsappNumber: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12 flex-1"
                                placeholder="01 02 03 04 05"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {isWorker && (
                        <>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Tarif horaire (FCFA)
                            </label>
                            <input
                              type="number"
                              value={editFormData.hourlyRate}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  hourlyRate: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12"
                              placeholder="Ex: 5000"
                            />
                          </div>
                          <div className="space-y-1.5 relative">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Métier exact / Qualification
                            </label>
                            <input
                              type="text"
                              value={editFormData.profession}
                              onFocus={() => setIsProfDropdownOpen(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setIsProfDropdownOpen(false),
                                  200,
                                )
                              }
                              onChange={(e) => {
                                setEditFormData({
                                  ...editFormData,
                                  profession: e.target.value,
                                });
                                setIsProfDropdownOpen(true);
                              }}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12"
                            />
                            <AnimatePresence>
                              {isProfDropdownOpen &&
                                editFormData.profession !== undefined && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                                  >
                                    {COMMON_PROFESSIONS.filter((p) =>
                                      p
                                        .toLowerCase()
                                        .includes(
                                          editFormData.profession?.toLowerCase() ||
                                            "",
                                        ),
                                    ).map((prof, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => {
                                          setEditFormData({
                                            ...editFormData,
                                            profession: prof,
                                          });
                                          setIsProfDropdownOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
                                      >
                                        {prof}
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                    </div>

                    {isWorker && (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Description courte (Profil d'accueil)
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                confirmGenerateDescription("short")
                              }
                              disabled={isGeneratingShortDesc}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1.5 px-2 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Générer avec l'IA"
                            >
                              {isGeneratingShortDesc ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Wand2 className="w-3.5 h-3.5" />
                              )}
                              Générer
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={editFormData.shortDescription}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                shortDescription: e.target.value,
                              })
                            }
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none resize-none"
                            placeholder="Une phrase accrocheuse pour attirer les clients..."
                            maxLength={150}
                          />
                          <AnimatePresence>
                            {showAITip === "short" && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-2 rounded-lg border border-brand-100 dark:border-brand-800 flex items-start gap-2"
                              >
                                <Wand2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>
                                  Voici une proposition générée par l'IA.
                                  N'hésitez pas à l'ajuster selon votre style
                                  pour mieux mettre en valeur vos talents et
                                  attirer des clients !
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Vidéo de présentation courte (Optionnel, Max 50 Mo)
                          </label>
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">
                            💡 Format de la vidéo : l'affichage s'adapte
                            automatiquement et sera au format{" "}
                            <strong>4:3 sur mobile</strong> et{" "}
                            <strong>16:9 sur PC</strong>. Avant de poster,
                            veillez à centrer l'action principale et
                            assurez-vous que ce recadrage ne coupe pas une
                            partie importante de votre vidéo.
                          </p>
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isUploadingCloudinary}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 50 * 1024 * 1024) {
                                  toast.success(
                                    "La vidéo est trop volumineuse (maximum 50 Mo).",
                                  );
                                  e.target.value = "";
                                  return;
                                }
                                try {
                                  const url = await uploadToCloudinary(file);
                                  setEditFormData({
                                    ...editFormData,
                                    videoUrl: url,
                                  });
                                } catch (err: any) {
                                  toast.error(
                                    err.message ||
                                      "Erreur lors de l'envoi de la vidéo",
                                  );
                                } finally {
                                  e.target.value = "";
                                }
                              }
                            }}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50 dark:bg-slate-800 dark:file:bg-slate-700 dark:file:text-slate-200"
                          />
                          {isUploadingCloudinary && (
                            <div className="mt-2 text-sm text-brand-600 font-medium">
                              Envoi en cours vers le serveur...{" "}
                              {cloudinaryProgress}%
                              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 dark:bg-slate-700">
                                <div
                                  className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${cloudinaryProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {editFormData.videoUrl &&
                            editFormData.videoUrl.startsWith("data:video") && (
                              <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Vidéo
                                sélectionnée prête à être sauvegardée.
                              </div>
                            )}
                          {editFormData.videoUrl &&
                            !editFormData.videoUrl.startsWith("data:video") &&
                            !isUploadingCloudinary && (
                              <div className="mt-2 text-sm text-brand-600 font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Vidéo
                                hébergée en ligne sauvegardée.
                              </div>
                            )}
                          <div className="flex gap-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Importez une courte vidéo pour présenter vos
                              services.
                            </p>
                            {editFormData.videoUrl &&
                              !isUploadingCloudinary && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditFormData({
                                      ...editFormData,
                                      videoUrl: "",
                                    })
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Supprimer la vidéo
                                </button>
                              )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Description complète (À propos)
                            </label>
                            <button
                              type="button"
                              onClick={() => confirmGenerateDescription("full")}
                              disabled={isGeneratingDesc}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1.5 px-2 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Générer avec l'IA"
                            >
                              {isGeneratingDesc ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Wand2 className="w-3.5 h-3.5" />
                              )}
                              Générer
                            </button>
                          </div>
                          <textarea
                            rows={4}
                            value={editFormData.description}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                description: e.target.value,
                              })
                            }
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none resize-none"
                            placeholder="Présentez votre expérience, vos spécialités, et pourquoi les clients devraient vous choisir..."
                          />
                          <AnimatePresence>
                            {showAITip === "full" && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-2 rounded-lg border border-brand-100 dark:border-brand-800 flex items-start gap-2"
                              >
                                <Wand2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>
                                  Voici une proposition générée par l'IA.
                                  N'hésitez pas à l'ajuster selon votre style
                                  pour mieux mettre en valeur vos talents et
                                  attirer des clients !
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Disponibilités typiques
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Semaine (Lun-Ven)
                              </label>
                              <input
                                type="text"
                                value={editFormData.availWeekdays || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    availWeekdays: e.target.value,
                                  })
                                }
                                placeholder="ex: 08:00 - 18:00"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Samedi
                              </label>
                              <input
                                type="text"
                                value={editFormData.availSaturday || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    availSaturday: e.target.value,
                                  })
                                }
                                placeholder="ex: 09:00 - 14:00"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Dimanche
                              </label>
                              <input
                                type="text"
                                value={editFormData.availSunday || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    availSunday: e.target.value,
                                  })
                                }
                                placeholder="ex: Fermé"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none h-12 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Photos de vos réalisations (Portfolio)
                            </label>
                            <label className="text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer dark:text-brand-400">
                              + Ajout d'images
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAddPortfolioImage}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {editFormData.portfolio &&
                          editFormData.portfolio.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {editFormData.portfolio.map(
                                (img: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 dark:border-slate-700"
                                  >
                                    <img
                                      src={img}
                                      alt={`Réalisation ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemovePortfolioImage(idx)
                                        }
                                        className="bg-white dark:bg-slate-900 text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Aucune réalisation ajoutée.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
                      <div className="relative">
                        {editFormData.photo ? (
                          <img
                            src={editFormData.photo}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center text-slate-400">
                            <Camera className="w-8 h-8" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full cursor-pointer hover:bg-brand-700 transition shadow-sm">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpdateProfilePhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Photo de profil
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Une photo pro et rassurante attire 3x plus de clients.
                          (Obligatoire)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(false)}
                        className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-colors h-12"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 h-12 ring-2 ring-accent-400 ring-offset-2"
                      >
                        <Save className="w-5 h-5" /> Enregistrer les
                        modifications
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSubscriptionIntercept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 relative shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Abonnement requis
              </h3>
              <div className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed whitespace-pre-wrap text-left">
                {subscriptionInterceptMsg}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowSubscriptionIntercept(false);
                    document.getElementById("abonnements")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex justify-center items-center gap-2"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="inline-block"
                  >
                    ⭐
                  </motion.span>
                  Activer mon abonnement
                </button>
                <button
                  onClick={() => setShowSubscriptionIntercept(false)}
                  className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all active:scale-95"
                >
                  Plus tard
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Stats List */}
        {statsListModalData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setStatsListModalData(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white shrink-0">
                  {statsListModalData.title}
                </h3>
                <button onClick={() => setStatsListModalData(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full shrink-0">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {statsListModalData.requests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucun élément</p>
                ) : (
                  statsListModalData.requests.map((req, idx) => {
                    const amIWorkerForThisReq = String(req.workerId?._id || req.workerId) === String(user?._id);
                    let otherName = "Inconnu";
                    if (amIWorkerForThisReq) {
                      if (req.clientId?.entityType === "company" && req.clientId?.companyName) otherName = req.clientId.companyName;
                      else if (req.clientId?.name) otherName = req.clientId.name;
                      else if (req.guestContact) otherName = `Invité (${req.guestContact})`;
                      else otherName = "Client Inconnu";
                    } else {
                      if (req.workerId?.entityType === "company" && req.workerId?.companyName) otherName = req.workerId.companyName;
                      else if (req.workerId?.name) otherName = req.workerId.name;
                      else otherName = "Artisan Inconnu";
                    }

                    return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSelectRequest(req);
                        setStatsListModalData(null);
                      }}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {(req.status === "accepted" || req.status === "completed") ? (
                            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" title="Acceptée" />
                          ) : req.status === "rejected" ? (
                            <X className="w-4 h-4 text-red-500 stroke-[3]" title="Rejetée" />
                          ) : null}
                          Réf: {(req.tenderId?.reference || req._id || "").substring((req.tenderId?.reference || req._id || "").length - 6).toUpperCase()} - {otherName}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {new Date(req.date).toLocaleDateString()} à {new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        {req.tenderId ? req.tenderId.title : req.serviceDetails}
                      </p>
                    </div>
                  )})
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Offer Confirmation */}
        {offerConfirmRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent dark:from-brand-500/5 pointer-events-none" />
              
              <div className="relative mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                  className="w-20 h-20 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Handshake className="w-10 h-10 text-brand-600 dark:text-brand-400" />
                </motion.div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Proposition d'offre
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                Une offre a été acceptée verbalement au cours de l'échange. Souhaitez-vous confirmer l'accord ?
              </p>
              
              <div className="flex flex-col gap-3 relative z-10">
                <button
                  onClick={handleConfirmOffer}
                  disabled={isProcessingOffer}
                  className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isProcessingOffer ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Confirmer l'accord
                    </>
                  )}
                </button>
                <button
                  onClick={handleRefuseOffer}
                  disabled={isProcessingOffer}
                  className="w-full py-3.5 px-6 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                  {isProcessingOffer ? (
                    <div className="w-5 h-5 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <X className="w-5 h-5" /> Refuser
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Offer Success */}
        {showOfferSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_0_40px_rgba(37,211,102,0.3)] text-center border-2 border-[#25D366]/50 overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-24 h-24 mx-auto bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg mb-6 shadow-[#25D366]/40"
              >
                <Check className="w-12 h-12" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
              >
                Félicitations ! 🎉
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 dark:text-slate-300 mb-8 flex flex-col gap-2"
              >
                <span>L'offre a été confirmée avec succès.</span>
                <span className="text-sm opacity-80">Vous pouvez maintenant démarrer ou suivre la prestation en toute confiance.</span>
              </motion.p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowOfferSuccessModal(false)}
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
              >
                Super !
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
