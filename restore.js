const fs = require('fs');

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const missingTop = \`import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useSettingsStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, User, Loader2, Search, MapPin, ChevronRight, MessageSquare, 
  Clock, PlusCircle, PenTool, CheckCircle2, Shield, Settings,
  LogOut, Phone, Mail, FileText, Download, Check, Link, ArrowRight, Wallet, Banknote, HelpCircle, 
  Briefcase, Activity, Share2, Facebook, Twitter, MessageCircle, Star, X, Eye, EyeOff, LayoutDashboard, Send, Paperclip, AlertCircle, Square, Trash2, Mic, Handshake, Info
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { io, Socket } from 'socket.io-client';

const LOCAL_PAYMENT_METHODS_BY_COUNTRY = {
  "Togo": ["Tmoney", "Flooz"],
  "Bénin": ["MTN Mobile Money", "Moov Money"],
  "Sénégal": ["Orange Money", "Wave", "Free Money"],
  "Côte d'Ivoire": ["Orange Money", "MTN Mobile Money", "Moov Money", "Wave"],
  "Burkina Faso": ["Orange Money", "Moov Money"],
  "Mali": ["Orange Money", "Moov Money"],
  "Niger": ["Airtel Money", "Moov Money"],
  "Guinée": ["Orange Money", "MTN Mobile Money"],
  "Cameroun": ["Orange Money", "MTN Mobile Money"],
  "Gabon": ["Airtel Money", "Moov Money"],
  "Congo": ["Airtel Money", "MTN Mobile Money"],
  "République Démocratique du Congo": ["Airtel Money", "Orange Money", "M-Pesa", "Afrimoney"]
};

export default function Dashboard() {
  const { user, token, setUser, login, logout } = useAuthStore();
  const { settings } = useSettingsStore();
  
  const computedWalletBalance = ((user?.referralStats?.totalRevenue || 0) - (user?.referralStats?.transferredRevenue || 0));

  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isKycLoading, setIsKycLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('requests');
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositPlanId, setDepositPlanId] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const socketRef = useRef(null);
  
  const [replyText, setReplyText] = useState("");
  const [replyAudioUrl, setReplyAudioUrl] = useState(null);
  const [replyAudioData, setReplyAudioData] = useState(null);
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState(null);
  const [isRecordingReply, setIsRecordingReply] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const replyMediaRecorderRef = useRef(null);

  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedRequest?.responses]);
\`;

const lines = dashboardCode.split('\\n');
lines.shift(); // remove the bad line 1

fs.writeFileSync('src/pages/Dashboard.tsx', missingTop + '\\n' + lines.join('\\n'), 'utf8');
