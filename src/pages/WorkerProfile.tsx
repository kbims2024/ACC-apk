import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../lib/store";
import {
  Star,
  MapPin,
  Briefcase,
  Camera,
  CheckCircle,
  Clock,
  ShieldCheck,
  Mail,
  MessageCircle,
  Phone,
  Mic,
  Square,
  Trash2,
  UserPlus,
  Play,
  Video,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { io, Socket } from "socket.io-client";
import ProgressConfirm from "../components/ProgressConfirm";

function RatingInput() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const num = index + 1;
        return (
          <label
            key={num}
            className="cursor-pointer"
            onMouseEnter={() => setHover(num)}
            onMouseLeave={() => setHover(0)}
          >
            <input
              type="radio"
              name="rating"
              value={num}
              required
              className="hidden"
              onChange={() => setRating(num)}
            />
            <Star
              className={`w-8 h-8 transition-colors ${
                num <= (hover || rating)
                  ? "fill-amber-500 text-amber-500"
                  : "text-slate-300 dark:text-slate-600"
              }`}
            />
          </label>
        );
      })}
    </div>
  );
}

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [requestText, setRequestText] = useState("");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [guestContact, setGuestContact] = useState("");
  const [showAuthIntercept, setShowAuthIntercept] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const { login } = useAuthStore();

  const handleSwitchToClient = async () => {
    setIsSwitchingAccount(true);
    try {
      const res = await fetch("/api/auth/switch-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole: "client" }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.token);
        setShowSwitchAccountModal(false);
        toast.success("Basculement réussi !");
        // Proceed with discussing
        handleQuickDiscuss();
      } else {
        const errorData = await res.json();
        if (res.status === 404) {
          // Account doesn't exist, we must navigate to register pre-filled with email
          toast("Veuillez créer votre compte client avec le même email.", { icon: 'ℹ️', duration: 5000 });
          navigate(`/register?email=${encodeURIComponent(user?.email || "")}&role=client`);
        } else {
          toast.error(errorData.error || "Erreur lors du basculement");
        }
      }
    } catch(err) {
      toast.error("Erreur de connexion serveur");
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleQuickDiscuss = async () => {
    if (!token || !user) {
      setShowAuthIntercept(true);
      return;
    }
    
    // Check if the current user is a worker and is trying to contact themselves
    if (user.role === 'worker' && String(user._id) === String(id)) {
      toast.error("Vous ne pouvez pas discuter avec vous-même.");
      return;
    }

    if (user.role === 'worker') {
      setShowSwitchAccountModal(true);
      return;
    }

    const toastId = toast.loading("Ouverture de la discussion...");

    try {
      // Let's check from /api/requests if there's an existing request with this worker
      const requestsRes = await fetch("/api/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      let existingReq = null;
      if (requestsRes.ok) {
        const reqList = await requestsRes.json();
        // Look for any request where workerId is this profile's worker (id)
        existingReq = reqList.find((r: any) => {
          const wId = r.workerId?._id || r.workerId;
          return String(wId) === String(id) && r.status === "pending";
        });
      }

      if (existingReq) {
        toast.dismiss(toastId);
        toast.success("Discussion ouverte !");
        navigate(`/dashboard?chat=${existingReq._id}`);
        return;
      }

      // If no existing request, let's create a new one!
      const contactVal = user.phone || user.email || "app_user";
      const startRes = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerId: id,
          serviceDetails: "Discussion instantanée initiée.",
          location: worker?.location || "En ligne",
          date: new Date().toISOString(),
          contactMethod: user.phone ? "phone" : user.email ? "email" : "app",
          guestContact: contactVal,
        }),
      });

      toast.dismiss(toastId);

      if (!startRes.ok) {
        const errorData = await startRes.json();
        throw new Error(errorData.error || "Erreur lors de l'initiation de la discussion");
      }

      const newReq = await startRes.json();
      toast.success("Discussion initiée !");
      navigate(`/dashboard?chat=${newReq._id}`);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Impossible d'initier la discussion.");
    }
  };

  useEffect(() => {
    const draftedRequest = localStorage.getItem('pendingRequestText');
    if (draftedRequest) {
      setRequestText(draftedRequest);
      setShowModal(true);
      localStorage.removeItem('pendingRequestText');
    }
    
    // Check for contact parameter in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('contact') === 'true') {
      if (token && user) {
        handleQuickDiscuss();
      } else {
        setShowAuthIntercept(true);
      }
      // Clean up URL
      window.history.replaceState({}, '', `/worker/${id}`);
    }
  }, [id, token, user]);

  useEffect(() => {
    if (user) {
      if (contactMethod === 'whatsapp' && user.whatsappPhone) {
        setGuestContact(user.whatsappPhone);
      } else if (contactMethod === 'email' && user.email) {
        setGuestContact(user.email);
      } else if (contactMethod === 'phone' && user.phone) {
        setGuestContact(user.phone);
      } else {
        setGuestContact("");
      }
    }
  }, [contactMethod, user]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioData(reader.result as string);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        toast.error("Impossible d'accéder au microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioData(null);
    setAudioUrl(null);
  };

  const socketRef = useRef<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    socketRef.current = io({
      transports: ["polling", "websocket"],
    });

    socketRef.current.on("connect", () => {
      // Emit checkStatus when connected to check if worker is online
      socketRef.current?.emit("checkStatus", [id]);
    });

    socketRef.current.on("statusUpdate", (statuses: any[]) => {
      const workerStatus = statuses.find((s) => s.userId === id);
      if (workerStatus) {
        setIsOnline(workerStatus.status === "online");
      }
    });

    socketRef.current.on("userStatus", ({ userId, status }) => {
      if (userId === id) {
        setIsOnline(status === "online");
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await fetch(`/api/users/workers/${id}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setWorker(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReviewPhotos((prev) => [...prev, reader.result as string]);
        }
      };
    });
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() && !audioData) {
      toast.error("Veuillez décrire votre besoin (texte ou message vocal);.");
      return;
    }
    
    if (!user) {
      if (requestText) {
        localStorage.setItem('pendingRequestText', requestText);
      }
      localStorage.setItem('pendingRequestContactMethod', contactMethod);
      localStorage.setItem('pendingRequestGuestContact', guestContact);
      setShowAuthIntercept(true);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitProgress(0);
    setRequestSent(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers,
        body: JSON.stringify({
          workerId: worker._id,
          serviceDetails: requestText,
          audioData,
          location: "Non spécifié par le client",
          date: new Date().toISOString(),
          contactMethod,
          guestContact,
        }),
      });
      clearInterval(progressInterval);
      setSubmitProgress(100);
      
      if (res.ok) {
        setTimeout(() => {
          setRequestSent(true);
          setIsSubmitting(false);
          // Only close modal when user clicks 'Close' inside ProgressConfirm
        }, 300);
      } else {
        setIsSubmitting(false);
        console.error("Failed to create request");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!worker)
    return <div className="text-center py-20">Artisan introuvable</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 py-8 pb-32 md:pb-20"
    >
      <Link
        to="/search"
        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white font-medium text-sm mb-6 inline-flex items-center gap-2"
      >
        &larr; Retour à la recherche
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column (Profile Info) */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {worker.photo ? (
                <img src={worker.photo} alt={worker.name} className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-24 h-24 bg-brand-100 text-brand-700 text-3xl font-display font-bold rounded-2xl flex items-center justify-center shrink-0 dark:text-brand-400">
                  {worker.companyName
                    ? worker.companyName.charAt(0).toUpperCase()
                    : worker.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    {worker.entityType === "company" && worker.companyName
                      ? worker.companyName
                      : worker.name}
                  </h1>
                  <ShieldCheck
                    className="w-6 h-6 text-emerald-500"
                    title="Profil vérifié"
                  />
                  {isOnline ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      En ligne
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Hors ligne
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 font-medium text-sm">
                  {worker.entityType === "company" && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wide">
                      Entreprise
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                    {worker.profession || "Professionnel"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />{" "}
                    {worker.location ? `${worker.location}, ${worker.country || ''}` : "Localisation non précisée"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                À propos
              </h3>
              
              {worker.shortDescription && (
                <p className="text-xl font-medium text-brand-700 dark:text-brand-300 mb-6 italic border-l-4 border-brand-200 dark:border-brand-800 pl-4 py-1">
                  "{worker.shortDescription}"
                </p>
              )}
              
              {worker.videoUrl && (
                <div className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-xl ring-4 ring-slate-100 dark:ring-slate-800 mb-8 mx-auto md:mx-0">
                  {(() => {
                    const url = worker.videoUrl;
                    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
                       const videoId = url.includes('youtube.com') ? url.split('v=')[1]?.split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
                       return <iframe className="w-full aspect-[4/3] md:aspect-video object-cover pointer-events-none" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`} title="Vidéo" allowFullScreen allow="autoplay; encrypted-media"></iframe>;
                    }
                    if (url.includes('tiktok.com')) {
                       const videoId = url.split('/video/')[1]?.split('?')[0];
                       if (videoId) return <iframe className="w-full aspect-[3/4] md:aspect-[9/16] pointer-events-none" src={`https://www.tiktok.com/embed/v2/${videoId}`} title="Vidéo TikTok"></iframe>;
                    }
                    // For standard video files (Cloudinary, mp4)
                    return <video className="w-full aspect-[4/3] md:aspect-video object-cover" autoPlay loop muted playsInline src={url}></video>;
                  })()}
                </div>
              )}

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                {worker.description ||
                  "Cet artisan n'a pas encore ajouté de description complète, mais son profil a été vérifié par nos équipes pour garantir des interventions de qualité."}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Statut
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Vérifié
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Disponibilité
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    En semaine
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Disponibilités typiques
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300">Lundi - Vendredi</span>
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{worker.availWeekdays || "08:00 - 18:00"}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300">Samedi</span>
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{worker.availSaturday || "09:00 - 14:00"}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 opacity-60">
                <span className="font-medium text-slate-700 dark:text-slate-300">Dimanche</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{worker.availSunday || "Fermé"}</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              Ces horaires sont indicatifs. N'hésitez pas à demander un devis pour confirmer la disponibilité exacte de l'artisan pour votre projet.
            </p>
          </div>

          {/* Portfolio */}
          {worker.portfolio && worker.portfolio.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Quelques
                réalisations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {worker.portfolio.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors"></div>
                    <img
                      src={img}
                      alt={`Réalisation ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Avis clients ({worker.reviewsCount})
              </h3>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-700">
                  {worker.rating}/5
                </span>
              </div>
            </div>

            {user && user.role !== "worker" && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const rating = formData.get("rating");
                  const comment = formData.get("comment");
                  try {
                    const res = await fetch(`/api/users/workers/${worker._id}/reviews`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({ rating: Number(rating), comment, photos: reviewPhotos }),
                    });
                    if (res.ok) {
                      const newReview = await res.json();
                      toast.success("Merci pour votre avis !");
                      // Mettre à jour l'état local pour refléter le changement en temps réel
                      setWorker((prev: any) => {
                        const updated = { ...prev };
                        updated.reviewsCount = (updated.reviewsCount || 0) + 1;
                        updated.rating = Number(((updated.rating * (updated.reviewsCount - 1) + Number(rating)) / updated.reviewsCount).toFixed(1));
                        
                        // Structure du nouveau "review" (on simule le "populate" pour l'affichage immédiat)
                        const populatedReview = {
                          ...newReview,
                          clientId: {
                            _id: user._id,
                            name: user.name,
                            photo: user.photo
                          }
                        };
                        
                        updated.reviews = [populatedReview, ...(updated.reviews || [])];
                        return updated;
                      });
                      e.currentTarget.reset();
                      setReviewPhotos([]);
                    } else {
                      const data = await res.json();
                      toast.error(data.error || "Erreur lors de l'ajout de l'avis");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur serveur");
                  }
                }}
                className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Laisser un avis</h4>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Note (1 à 5 étoiles) <span className="text-red-500">*</span></label>
                  <RatingInput />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Commentaire</label>
                  <textarea 
                    name="comment" 
                    rows={3} 
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-brand-500 resize-none transition-colors"
                    placeholder="Partagez votre expérience avec cet artisan..."
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Photos (optionnel)</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {reviewPhotos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReviewPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-110 active:scale-95 transition-transform"
                        >
                          <X className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-brand-200 hover:border-brand-400 dark:border-brand-800 dark:hover:border-brand-600 bg-brand-50/50 hover:bg-brand-50 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0">
                      <Camera className="w-6 h-6 text-brand-500 mb-1" />
                      <span className="text-[10px] font-medium text-brand-600">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleReviewPhotoUpload}
                      />
                    </label>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition">Publier l'avis</button>
              </form>
            )}

            <div className="space-y-6">
              {worker.reviews && worker.reviews.length > 0 ? (
                worker.reviews.map((review: any) => (
                  <div
                    key={review._id}
                    className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white ml-2">
                        {review.clientId?.name || "Client"}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                      {review.comment}
                    </p>
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.photos.map((photo: string, index: number) => (
                          <div key={index} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
                            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(photo, '_blank')} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Ce profil n'a pas encore d'avis.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sticky CTA) */}
        <div className="md:col-span-1">
          {/* Main sticky box for desktop, floating bar for mobile */}
          <div className="md:sticky md:top-24 bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl p-6 border-t md:border border-slate-100 dark:border-slate-800 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] fixed bottom-0 left-0 right-0 z-40 md:relative md:z-0">
            <div className="hidden md:block text-center mb-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Tarif indicatif
              </p>
              <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                {worker.hourlyRate ? `${worker.hourlyRate} F` : "Sur devis"}
                {worker.hourlyRate && (
                  <span className="text-lg text-slate-400 font-medium">/h</span>
                )}
              </p>
            </div>

            {requestSent ? (
              <div className="bg-emerald-50 text-emerald-700 p-3 md:p-4 rounded-xl text-center border border-emerald-100 flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 md:mx-auto md:mb-2 text-emerald-500 shrink-0" />
                <div className="text-left md:text-center">
                  <p className="font-bold mb-0.5 md:mb-1 text-sm md:text-base">
                    Demande envoyée !
                  </p>
                  <p className="text-xs md:text-sm text-emerald-600 truncate">
                    L'artisan a été notifié.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between md:hidden mb-1">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Tarif indicatif :
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {worker.hourlyRate
                        ? `${worker.hourlyRate} F`
                        : "Sur devis"}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleQuickDiscuss}
                    className="w-full h-12 md:h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 ring-2 ring-brand-400 ring-offset-2"
                  >
                    <MessageCircle className="w-5 h-5 text-white animate-bounce" />{" "}
                    <span>Contacter</span>
                  </button>
                </div>
              </>
            )}

            <p className="hidden md:flex text-xs text-slate-400 text-center mt-4 items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Protection garantie par la
              plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Modal / Popup for sending request */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {isSubmitting || requestSent ? (
              <ProgressConfirm
                isSubmitting={isSubmitting}
                isSuccess={requestSent}
                progress={submitProgress}
                successMessage={
                  <>
                    Demande envoyée avec succès !<br /><br />
                    L'artisan a été notifié et vous enverra un retour sur votre tableau de bord.
                  </>
                }
                onClose={() => setShowModal(false)}
              />
            ) : (
              <>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Décrivez votre besoin
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Ces informations aideront {worker.name} à préparer son intervention.
                </p>

                <form onSubmit={handleSendRequest} className="space-y-4">
          <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Détails du problème / projet
                </label>
                <div className="relative">
                  <textarea
                    required={!audioData}
                    rows={4}
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none font-medium text-slate-900 dark:text-white pr-14"
                    placeholder="Ex: J'ai une fuite d'eau importante dans ma salle de bain..."
                  />
                  {!audioData && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`absolute right-3 bottom-3 w-12 h-12 flex items-center justify-center rounded-full shadow-md transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f] text-white"}`}
                      title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message audio"}
                    >
                      {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                {audioData && audioUrl && (
                  <div className="mt-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <audio src={audioUrl} controls className="h-10 flex-1 min-w-0" />
                    <button
                      type="button"
                      onClick={clearRecording}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition shrink-0"
                      title="Supprimer l'enregistrement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Comment souhaitez-vous être contacté(e) ?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer transition-colors ${contactMethod === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]/10 text-[#25D366]' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <input type="radio" value="whatsapp" checked={contactMethod === 'whatsapp'} onChange={(e) => setContactMethod(e.target.value)} className="hidden" />
                    <MessageCircle className={`w-5 h-5 ${contactMethod === 'whatsapp' ? 'text-[#25D366]' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-semibold">WhatsApp</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer transition-colors ${contactMethod === 'email' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <input type="radio" value="email" checked={contactMethod === 'email'} onChange={(e) => setContactMethod(e.target.value)} className="hidden" />
                    <Mail className={`w-5 h-5 ${contactMethod === 'email' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-semibold">Email</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer transition-colors ${contactMethod === 'phone' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <input type="radio" value="phone" checked={contactMethod === 'phone'} onChange={(e) => setContactMethod(e.target.value)} className="hidden" />
                    <Phone className={`w-5 h-5 ${contactMethod === 'phone' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-semibold">Téléphone</span>
                  </label>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    {contactMethod === 'whatsapp' ? 'Votre numéro WhatsApp :' : contactMethod === 'email' ? 'Votre adresse email :' : 'Votre numéro de téléphone :'}
                  </label>
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    required
                    maxLength={100}
                    placeholder={contactMethod === 'whatsapp' ? '+123456789' : contactMethod === 'email' ? 'vous@exemple.com' : '0123456789'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
            </>
          )}
          </motion.div>
        </div>
      )}

      {/* Switch Account Modal */}
      {showSwitchAccountModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">
              Action non autorisée
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-8 text-sm leading-relaxed">
              En tant qu'artisan, vous ne pouvez pas contacter directement un autre artisan. Vous devez basculer sur votre compte client pour effectuer cette action.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSwitchToClient}
                disabled={isSwitchingAccount}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition shadow-lg shadow-brand-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSwitchingAccount ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Basculer sur mon compte client"
                )}
              </button>
              <button
                onClick={() => setShowSwitchAccountModal(false)}
                className="w-full py-3.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Rester sur le compte actuel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Auth Intercept Modal */}
      {showAuthIntercept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">
              Connexion requise
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm leading-relaxed">
              Pour envoyer une demande à cet artisan, vous devez être connecté. 
              Cela permet à l'artisan de vous recontacter facilement et de suivre l'avancement.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (requestText) localStorage.setItem('pendingRequestText', requestText);
                  navigate(`/login?redirect=/worker/${id}?contact=true`);
                }}
                className="w-full h-12 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition"
              >
                Se connecter / S'inscrire
              </button>
              <button 
                onClick={() => setShowAuthIntercept(false)}
                className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
