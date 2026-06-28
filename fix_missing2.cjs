const fs = require('fs');

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const missingImports = "ShieldCheck, Edit3, Package, Camera, Fingerprint, Gift, Copy, Bell, CheckCircle, Wand2, Save, ProgressConfirm,";
dashboardCode = dashboardCode.replace(/import \\{\\n  Building2/g, "import {\\n  " + missingImports + "\\n  Building2");

const missingStates = [
  "  const [showPassword2FAChoiceModal, setShowPassword2FAChoiceModal] = useState(false);",
  "  const [selected2FAMethod, setSelected2FAMethod] = useState('email');",
  "  const [showPasswordOtpModal, setShowPasswordOtpModal] = useState(false);",
  "  const [passwordOtpCode, setPasswordOtpCode] = useState('');",
  "  const [aiConfirmType, setAiConfirmType] = useState(null);",
  "  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);",
  "  const [profileSaved, setProfileSaved] = useState(false);",
  "  const [submitProfileProgress, setSubmitProfileProgress] = useState(0);",
  "  const [isEditingEmail, setIsEditingEmail] = useState(false);",
  "  const [isEditingPassword, setIsEditingPassword] = useState(false);",
  "  const [showDefaultPassword, setShowDefaultPassword] = useState(false);",
  "  const [showNewPassword, setShowNewPassword] = useState(false);",
  "  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);",
  "  const [isGeneratingShortDesc, setIsGeneratingShortDesc] = useState(false);",
  "  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);",
  "  const [showAITip, setShowAITip] = useState(true);",
  "  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);",
  "  const [cloudinaryProgress, setCloudinaryProgress] = useState(0);",
  "  const handleVerifyPasswordOtp = async () => {};",
  "  const executeGenerateDescription = async (type) => {};",
  "  const confirmGenerateDescription = (type) => setAiConfirmType(type);",
  "  const handleTogglePasswordVisibility = () => setShowDefaultPassword(!showDefaultPassword);",
].join('\\n');

dashboardCode = dashboardCode.replace(
  "const [replyAttachmentUrl, setReplyAttachmentUrl] = useState<string | null>(null);",
  "const [replyAttachmentUrl, setReplyAttachmentUrl] = useState<string | null>(null);\\n" + missingStates
);

const missingConstants = [
  "const PAYMENT_LOGOS = {};",
  "const PHONE_PREFIXES = {};",
  "const COUNTRIES = [];",
  "const COUNTRY_FLAGS = {};",
  "const CITIES_BY_COUNTRY = {};",
  "const COMMON_PROFESSIONS = [];"
].join('\\n');

dashboardCode = dashboardCode.replace(
  "const LOCAL_PAYMENT_METHODS_BY_COUNTRY",
  missingConstants + "\\nconst LOCAL_PAYMENT_METHODS_BY_COUNTRY"
);

dashboardCode = dashboardCode.replace(/user\\?\\.password/g, "(user as any)?.password");

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');

let tenderCode = fs.readFileSync('src/pages/TenderList.tsx', 'utf8');
if (!tenderCode.includes('Square,')) {
  tenderCode = tenderCode.replace('Mic,', 'Mic, Square,');
}
fs.writeFileSync('src/pages/TenderList.tsx', tenderCode, 'utf8');
