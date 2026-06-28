import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { useAuthStore } from "../lib/store";
import {
  MapPin,
  Hammer,
  MessageSquare,
  Clock,
  PlusCircle,
  Building2,
  User,
  Loader2,
  UserPlus,
  Mic,
  Paperclip,
  X,
  Square,
  MessageCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

export default function TenderList() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const locationUrl = useLocation();
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthClientIntercept, setShowAuthClientIntercept] = useState(false);
  const [showAuthWorkerIntercept, setShowAuthWorkerIntercept] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tenderLocation, setTenderLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [tenderAudioUrl, setTenderAudioUrl] = useState("");
  const [tenderAttachmentUrl, setTenderAttachmentUrl] = useState("");

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      toast.success("Enregistrement audio non supporté.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks: Blob[] = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64AudioMessage = reader.result as string;
            setTenderAudioUrl(base64AudioMessage);
          };
          stream.getTracks().forEach((t) => t.stop());
        });

        mediaRecorder.start();
        setIsRecording(true);

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 30000);

        (window as any)._tenderMediaRecorder = mediaRecorder;
      })
      .catch((e) => {
        console.error(e);
        toast.success("Microphone inaccessible.");
      });
  };

  const stopRecording = () => {
    const mr = (window as any)._tenderMediaRecorder;
    if (mr && mr.state === "recording") {
      mr.stop();
      setIsRecording(false);
    }
  };

  const [activeTenderIdForQuote, setActiveTenderIdForQuote] = useState<
    string | null
  >(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteAttachmentUrl, setQuoteAttachmentUrl] = useState("");
  const [quoteAudioUrl, setQuoteAudioUrl] = useState("");
  const [isRecordingQuoteAudio, setIsRecordingQuoteAudio] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my_tenders">(
    locationUrl.state?.activeTab || "all",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "completed">(
    locationUrl.state?.statusFilter || "all"
  );

  const [serviceRequests, setServiceRequests] = useState<any[]>([]);

  const socketRef = useRef<any>(null);

  const startQuoteAudioRecording = () => {
    // We'll use SpeechRecognition to just populate text for simplicity if they want text via audio,
    // or we can use MediaRecorder if they strictly want an audio file.
    // The user said "donner les détail en audio", we'll do real audio recording for the quote.
    if (!navigator.mediaDevices) {
      toast.success("Enregistrement audio non supporté.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks: Blob[] = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64AudioMessage = reader.result as string;
            setQuoteAudioUrl(base64AudioMessage);
          };
          stream.getTracks().forEach((t) => t.stop());
        });

        mediaRecorder.start();
        setIsRecordingQuoteAudio(true);

        // stop after max 30 seconds or manually
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecordingQuoteAudio(false);
          }
        }, 30000);

        (window as any)._quoteMediaRecorder = mediaRecorder;
      })
      .catch((e) => {
        console.error(e);
        toast.success("Microphone inaccessible.");
      });
  };

  const stopQuoteAudioRecording = () => {
    const mr = (window as any)._quoteMediaRecorder;
    if (mr && mr.state === "recording") {
      mr.stop();
      setIsRecordingQuoteAudio(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 2MB);.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuoteAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTenderFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 2MB);.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setTenderAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (locationUrl.state?.activeTab) {
      setActiveTab(locationUrl.state.activeTab);
    }
    if (locationUrl.state?.statusFilter) {
      setStatusFilter(locationUrl.state.statusFilter);
    }
    fetchTenders().then((data) => {
      if (locationUrl.state?.scrollToTender) {
        setTimeout(() => {
          document
            .getElementById(`tender-${locationUrl.state.scrollToTender}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
      if (locationUrl.state?.openQuoteForTender) {
        setActiveTenderIdForQuote(locationUrl.state.openQuoteForTender);
        setTimeout(() => {
          document
            .getElementById(`tender-${locationUrl.state.openQuoteForTender}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    });
  }, [locationUrl.state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "create") {
      if (!user) {
        setShowAuthClientIntercept(true);
      } else {
        setShowCreateModal(true);
      }
      window.history.replaceState({}, "", "/appels-offres");
    }
  }, [user]);

  const fetchTenders = async () => {
    try {
      const res = await fetch("/api/tenders");
      if (res.ok) {
        const data = await res.json();
        setTenders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServiceRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markResponseAsConsulted = async (tenderId: string, responseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tenders/${tenderId}/responses/${responseId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setTenders(prev => prev.map(t => {
          if (t._id === tenderId) {
            return {
              ...t,
              responses: t.responses.map((r: any) => {
                if (r._id === responseId) {
                  return { ...r, isConsulted: true };
                }
                return r;
              })
            };
          }
          return t;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Socket inside TenderList
  useEffect(() => {
    if (!user?._id) return;
    
    fetchServiceRequests();

    socketRef.current = io({
      transports: ["polling", "websocket"],
    });

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join", user._id);
    });

    socketRef.current.on("newRequest", () => {
      fetchServiceRequests();
      fetchTenders();
    });

    socketRef.current.on("requestUpdated", () => {
      fetchServiceRequests();
      fetchTenders();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id, token]);



  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/tenders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.toUpperCase(),
          description,
          location: tenderLocation,
          audioData: tenderAudioUrl,
          attachmentUrl: tenderAttachmentUrl,
        }),
      });
      if (!res.ok) {
        let errMessage = "Erreur";
        try {
          const data = await res.json();
          errMessage = data.error || errMessage;
        } catch (e) {}
        throw new Error(errMessage);
      }

      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setTenderLocation("");
      setTenderAudioUrl("");
      setTenderAttachmentUrl("");
      toast.success("Demande de devis publiée avec succès !");
      fetchTenders();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la publication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent, tenderId: string) => {
    e.preventDefault();
    if (!token) return toast.error("Veuillez vous connecter.");
    if (user?.role !== "worker")
      return toast.success("Seuls les artisans peuvent proposer un devis.");

    setIsSubmittingQuote(true);
    try {
      const res = await fetch(`/api/tenders/${tenderId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: Number(quotePrice),
          text: quoteText,
          attachmentUrl: quoteAttachmentUrl,
          audioUrl: quoteAudioUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      toast.success("Devis envoyé avec succès !");
      setActiveTenderIdForQuote(null);
      setQuotePrice("");
      setQuoteText("");
      setQuoteAttachmentUrl("");
      setQuoteAudioUrl("");
      fetchTenders();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleAcceptQuote = async (tenderId: string, workerId: string) => {
    if (!token) return toast.error("Veuillez vous connecter.");
    if (!window.confirm("Voulez-vous accepter ce devis ?")) return;
    try {
      const res = await fetch(`/api/tenders/${tenderId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      toast.success("Devis accepté ! L'artisan a été notifié.");
      setActiveTab("my_tenders");
      fetchTenders().then(() => {
        setTimeout(() => {
          document
            .getElementById(`tender-${tenderId}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDiscuss = async (
    tenderId: string,
    tenderTitle: string,
    targetUserId: string,
    price: number,
  ) => {
    if (!token) return toast.error("Veuillez vous connecter.");
    try {
      const payload = {
        workerId: user?.role === "worker" ? user._id : targetUserId,
        clientId: user?.role === "worker" ? targetUserId : user?._id,
        tenderId: tenderId,
        serviceDetails: `[Discussion devis: ${price} FCFA] concernant la demande de devis "${tenderTitle}"`,
        location: "Via demande de devis",
        isWorkerInitiated: user?.role === "worker"
      };
      
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur");
      }

      toast.success("Discussion initiée.");
      navigate(`/dashboard?chat=${data._id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Demandes de devis publiques
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Trouvez des chantiers ou proposez vos projets à la communauté.
          </p>
        </div>
        {user?.role !== "worker" && user && (
          <button
            onClick={() => {
              setShowCreateModal(true);
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            Publier une demande de devis
          </button>
        )}
        {!user && (
          <button
            onClick={() => {
              setShowAuthClientIntercept(true);
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            Publier une demande de devis
          </button>
        )}
      </div>


      <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${statusFilter === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:border-brand-300"}`}
        >
          Tout statut
        </button>
        <button
          onClick={() => setStatusFilter("open")}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${statusFilter === "open" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:border-brand-300"}`}
        >
          En cours
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${statusFilter === "completed" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:border-brand-300"}`}
        >
          Terminées
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 pb-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        </div>
      ) : (
        (() => {
          const filteredTenders = tenders.filter((t) => {
            if (activeTab === "my_tenders") {
              if (statusFilter === "open") return t.clientId && String(t.clientId._id) === String(user?._id) && t.status === "open";
              if (statusFilter === "completed") return t.clientId && String(t.clientId._id) === String(user?._id) && t.status === "accepted";
              return t.clientId && String(t.clientId._id) === String(user?._id);
            }
            if (statusFilter === "open") return t.status === "open";
            if (statusFilter === "completed") return t.status === "accepted";
            return true;
          });

          if (filteredTenders.length === 0) {
            return (
              <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 border border-slate-100 dark:border-slate-800">
                <Hammer className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Aucune demande de devis en cours
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Soyez le premier à publier un besoin sur la plateforme.
                </p>
              </div>
            );
          }

          return (
            <div className="grid gap-6">
              {filteredTenders.map((tender) => (
                <motion.div
                  id={`tender-${tender._id}`}
                  key={tender._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <span>{tender.title}</span>
                        {tender.tenderId && (
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-md">
                            {tender.tenderId}
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {tender.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />{" "}
                          {new Date(tender.createdAt).toLocaleDateString()}
                        </span>
                        {tender.clientId ? (
                          <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                            {tender.clientId.entityType === "company" ? (
                              <Building2 className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            {tender.clientId.entityType === "company" &&
                            tender.clientId.companyName
                              ? tender.clientId.companyName
                              : tender.clientId.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                            <User className="w-4 h-4" /> Invité{" "}
                            {tender.guestContact && `(${tender.guestContact})`}
                          </span>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const isClientOwner = user && tender.clientId && String(user._id) === String(tender.clientId._id || tender.clientId);
                      const isWorker = user && user.role === "worker";

                      if (isClientOwner) {
                        return (
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3.5 py-1.5 rounded-full font-bold text-xs ${tender.status === 'open' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                              {tender.status === "open" ? "En cours" : "Terminée"}
                            </span>
                          </div>
                        );
                      }

                      // Artisan or other viewer
                      const artisanResponse = tender.responses?.find(
                        (r: any) => String(r.workerId?._id || r.workerId) === String(user?._id)
                      );
                      const hasResponded = !!artisanResponse;

                      const matchingRequest = serviceRequests.find(sr => 
                        String(sr.tenderId?._id || sr.tenderId) === String(tender._id) &&
                        String(sr.workerId?._id || sr.workerId) === String(user?._id)
                      );
                      const unreadChatCountForWorker = matchingRequest?.workerUnreadCount || 0;

                      if (isWorker) {
                        if (!hasResponded) {
                          return (
                            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                              <button
                                onClick={() => {
                                  setActiveTenderIdForQuote(
                                    activeTenderIdForQuote === tender._id ? null : tender._id
                                  );
                                }}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold transition w-full text-center text-sm shadow-sm"
                              >
                                {activeTenderIdForQuote === tender._id ? "Fermer" : "Proposer un devis"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDiscuss(
                                    tender._id,
                                    tender.title,
                                    tender.clientId?._id || tender.clientId,
                                    0
                                  )
                                }
                                className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold transition w-full text-center text-sm flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4 text-brand-500" />
                                <span>Discuter</span>
                                {unreadChatCountForWorker > 0 && (
                                  <span className="bg-rose-500 font-bold text-[10px] text-white px-2 py-0.5 rounded-full animate-bounce">
                                    {unreadChatCountForWorker}
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        } else {
                          // Already responded
                          const isAccepted = tender.status === "accepted" && String(tender.acceptedWorkerId?._id || tender.acceptedWorkerId) === String(user?._id);
                          const isRejected = tender.status === "accepted" && String(tender.acceptedWorkerId?._id || tender.acceptedWorkerId) !== String(user?._id);

                          return (
                            <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto shrink-0">
                              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold text-sm text-center border-emerald-200">
                                Devis envoyé
                              </span>
                              {isAccepted ? (
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-xs text-center shadow-sm flex items-center justify-center gap-1.5 ring-4 ring-emerald-100 dark:ring-emerald-950/50">
                                  <span>🎉 Félicitations ! Votre devis a été validé !</span>
                                </span>
                              ) : isRejected ? (
                                <span className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 px-4 py-2 rounded-lg font-bold text-xs text-center border border-rose-200/50 dark:border-rose-900/30">
                                  ❌ Votre devis n'a pas été retenu.
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-4 py-2 rounded-lg font-bold text-xs text-center border border-amber-200/50 dark:border-amber-900/30">
                                  ⌛ Résultat en attente
                                </span>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {matchingRequest && (
                                  <button
                                    onClick={() => navigate('/dashboard', { state: { selectedRequestId: matchingRequest._id }})}
                                    className="border border-brand-200 dark:border-brand-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-xl font-bold transition flex-1 text-center text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Voir mon devis</span>
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDiscuss(
                                      tender._id,
                                      tender.title,
                                      tender.clientId?._id || tender.clientId,
                                      artisanResponse.price
                                    )
                                  }
                                  className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold transition flex-1 text-center text-xs flex items-center justify-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                                  <span>Discuter</span>
                                  {unreadChatCountForWorker > 0 && (
                                    <span className="bg-rose-500 font-bold text-[9px] text-white px-1.5 py-0.5 rounded-full animate-bounce">
                                      {unreadChatCountForWorker}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        }
                      }

                      // Anonymous or normal role non-creators
                      return (
                        <button
                          onClick={() => {
                            if (!user) {
                              setShowAuthWorkerIntercept(true);
                            } else if (user.role !== "worker") {
                              setShowAuthWorkerIntercept(true);
                            } else {
                              setActiveTenderIdForQuote(
                                activeTenderIdForQuote === tender._id ? null : tender._id
                              );
                            }
                          }}
                          className="bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-brand-400 px-5 py-2.5 rounded-xl font-bold transition-colors w-full md:w-auto text-center"
                        >
                          {activeTenderIdForQuote === tender._id ? "Fermer" : "Proposer un devis"}
                        </button>
                      );
                    })()}
                  </div>

                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {tender.description}
                  </div>

                  {tender.audioData && (
                    <div className="mt-3">
                      <audio
                        src={tender.audioData}
                        controls
                        className="h-10 w-full max-w-sm"
                      />
                    </div>
                  )}

                  {tender.attachmentUrl && (
                    <div className="mt-4">
                      {tender.attachmentUrl.startsWith("data:image") ? (
                        <img
                          src={tender.attachmentUrl}
                          alt="Pièce jointe"
                          className="max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer object-cover"
                          onClick={() => window.open(tender.attachmentUrl, "_blank")}
                        />
                      ) : (
                        <a
                          href={tender.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm font-semibold">Télecharger la pièce jointe</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Quote Form */}
                  {activeTenderIdForQuote === tender._id && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mt-2">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                        Votre proposition tarifaire
                      </h4>
                      <form
                        onSubmit={(e) => handleSubmitQuote(e, tender._id)}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Montant estimé (FCFA)
                          </label>
                          <input
                            type="number"
                            required
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                            placeholder="Ex: 15000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Détails ou message (optionnel)
                          </label>
                          <div className="relative">
                            <textarea
                              value={quoteText}
                              onChange={(e) => setQuoteText(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500 resize-none min-h-[120px] pb-12"
                              rows={3}
                              placeholder="Précisez votre disponibilité ou ce que le prix inclut..."
                            />
                            {!quoteAudioUrl && (
                               <button
                                type="button"
                                onClick={
                                  isRecordingQuoteAudio
                                    ? stopQuoteAudioRecording
                                    : startQuoteAudioRecording
                                }
                                className={`absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition flex-shrink-0 ${isRecordingQuoteAudio ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f]"}`}
                              >
                                {isRecordingQuoteAudio ? (
                                  <Square className="w-4 h-4 fill-current" />
                                ) : (
                                  <Mic className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {/* File Upload Button */}
                          <label className="cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                            <Paperclip className="w-4 h-4" />
                            {quoteAttachmentUrl
                              ? "Fichier joint"
                              : "Joindre un PDF/Image"}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>

                          {quoteAttachmentUrl && (
                            <button
                              type="button"
                              onClick={() => setQuoteAttachmentUrl("")}
                              className="text-red-500 p-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {quoteAudioUrl && (
                            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
                              Vocal enregistré
                              <button
                                type="button"
                                onClick={() => setQuoteAudioUrl("")}
                                className="text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isSubmittingQuote}
                            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                          >
                            {isSubmittingQuote
                              ? "Envoi..."
                              : "Envoyer ma proposition"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDiscuss(tender._id, tender.title, tender.clientId?._id || tender.clientId, 0)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm border border-slate-100 dark:border-slate-800"
                          >
                            <MessageSquare className="w-5 h-5 text-brand-500" />
                            Discuter avant
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                                  </motion.div>
              ))}
            </div>
          );
        })()
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 w-full max-w-lg relative">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Nouvelle demande de devis
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Détaillez votre besoin pour recevoir des devis pertinents.
            </p>

            <form onSubmit={handleCreateTender} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de l'offre
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: RÉNOVATION PEINTURE SALON"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lieu d'intervention
                </label>
                <input
                  type="text"
                  value={tenderLocation}
                  onChange={(e) => setTenderLocation(e.target.value)}
                  required
                  placeholder="Ex: Abidjan, Cocody Riviera 2"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description détaillée
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required={!tenderAudioUrl}
                    placeholder="Surface, délais, matériel à fournir ou non..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500 resize-none min-h-[140px] pb-12"
                  />
                  {!tenderAudioUrl && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition flex-shrink-0 ${isRecording ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f]"}`}
                    >
                      {isRecording ? (
                        <Square className="w-4 h-4 fill-current" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                {tenderAudioUrl && (
                  <div className="mt-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                    <audio
                      src={tenderAudioUrl}
                      controls
                      className="h-8 flex-1 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setTenderAudioUrl("")}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                  <Paperclip className="w-4 h-4" />
                  {tenderAttachmentUrl ? "Fichier joint" : "Joindre un PDF/Image"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleTenderFileUpload}
                  />
                </label>

                {tenderAttachmentUrl && (
                  <button
                    type="button"
                    onClick={() => setTenderAttachmentUrl("")}
                    className="text-red-500 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 py-3 rounded-xl font-bold shadow-md shadow-brand-500/20"
                >
                  {isSubmitting ? "Publication..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Intercept Client/Visitor Publishing */}
      {showAuthClientIntercept && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">
              Connexion requise
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm leading-relaxed">
              Pour publier une demande de devis, vous devez être inscrit.
              Certains champs seront pré-remplis avec les informations de votre
              profil.
            </p>
            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate(
                    "/register?role=client&returnTo=/appels-offres?action=create",
                  )
                }
                className="w-full h-12 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
              >
                S'enregistrer
              </button>
              <button
                onClick={() =>
                  navigate("/login?returnTo=/appels-offres?action=create")
                }
                className="w-full h-12 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowAuthClientIntercept(false)}
                className="w-full h-12 bg-transparent text-slate-500 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Auth Intercept Worker Answering */}
      {showAuthWorkerIntercept && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <Hammer className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">
              Compte Artisan Requis
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm leading-relaxed">
              Vous devez avoir un compte{" "}
              <strong className="text-brand-600 dark:text-brand-400">
                Prestataire / Artisan
              </strong>{" "}
              pour proposer un devis sur cette demande de devis.
            </p>
            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate("/register?role=worker&returnTo=/appels-offres")
                }
                className="w-full h-12 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
              >
                Devenir Artisan
              </button>
              <button
                onClick={() => navigate("/login?returnTo=/appels-offres")}
                className="w-full h-12 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowAuthWorkerIntercept(false)}
                className="w-full h-12 bg-transparent text-slate-500 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
