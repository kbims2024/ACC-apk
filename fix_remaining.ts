import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const moreIcons = "XCircle, Package, Camera, Fingerprint, Gift, Copy, Bell, Save,";
dash = dash.replace(/import \\{\\n  ShieldCheck,/g, "import {\\n  " + moreIcons + "\\n  ShieldCheck,");

const moreStates = [
  "  const [transferAmount, setTransferAmount] = useState<number>(0);",
  "  const [isTransferring, setIsTransferring] = useState(false);",
  "  const [showTransferModal, setShowTransferModal] = useState(false);",
  "  const [historyType, setHistoryType] = useState('all');",
  "  const [historyFilterType, setHistoryFilterType] = useState('all');",
  "  const [historySortOrder, setHistorySortOrder] = useState('desc');",
  "  const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false);",
  "  const [transferHistory, setTransferHistory] = useState<any[]>([]);",
  "  const [reviewRating, setReviewRating] = useState(5);"
].join('\\n');

dash = dash.replace(
  "const [showPassword2FAChoiceModal, setShowPassword2FAChoiceModal]", 
  moreStates + "\\n  const [showPassword2FAChoiceModal, setShowPassword2FAChoiceModal]"
);

const moreUtils = [
  "const parsePhone = (val: string) => val;",
  "const imageCompression = async (file: File, options?: any) => file;"
].join('\\n');

dash = dash.replace(
  "const PAYMENT_LOGOS",
  moreUtils + "\\nconst PAYMENT_LOGOS"
);

dash = dash.replace("const COUNTRIES = [];", "const COUNTRIES: any[] = [];");

fs.writeFileSync('src/pages/Dashboard.tsx', dash, 'utf8');

let tender = fs.readFileSync('src/pages/TenderList.tsx', 'utf8');
if (!tender.includes('Square,')) {
  tender = tender.replace('Mic,', 'Mic, Square,');
}
fs.writeFileSync('src/pages/TenderList.tsx', tender, 'utf8');
