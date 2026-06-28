import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const hookLines = [
  '  useEffect(() => {',
  '    if (chatScrollRef.current) {',
  '      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;',
  '    }',
  '  }, [selectedRequest?.responses]);'
].join('\\n');

dashboardCode = dashboardCode.replace('const { settings } = useSettingsStore();\\n' + hookLines, 'const { settings } = useSettingsStore();');

const hookInsert = '\\n' + hookLines + '\\n';

if (dashboardCode.includes('const { settings } = useSettingsStore();\\n\\n  useEffect(() => {\\n    if (chatScrollRef.current) {\\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\\n    }\\n  }, [selectedRequest?.responses]);')) {
  dashboardCode = dashboardCode.replace('const { settings } = useSettingsStore();\\n\\n  useEffect(() => {\\n    if (chatScrollRef.current) {\\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\\n    }\\n  }, [selectedRequest?.responses]);', 'const { settings } = useSettingsStore();');
}

// Remove it globally if possible
// We will just do a specific search for the block
dashboardCode = dashboardCode.replace(/\\s*useEffect\\(\\(\\) => \\{\\s*if \\(chatScrollRef\\.current\\) \\{\\s*chatScrollRef\\.current\\.scrollTop = chatScrollRef\\.current\\.scrollHeight;\\s*\\}\\s*\\}, \\[selectedRequest\\?\\.responses\\]\\);\\n*/g, '');


dashboardCode = dashboardCode.replace(
  'const chatScrollRef = useRef<HTMLDivElement>(null);',
  'const chatScrollRef = useRef<HTMLDivElement>(null);' + hookInsert
);

dashboardCode = dashboardCode.replace('import { Phone, Mail, MessageCircle,', 'import { Phone, Mail, MessageCircle, Paperclip, Send, Square,');

dashboardCode = dashboardCode.replace('user?.clearPassword', 'user?.password');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');

let tenderCode = fs.readFileSync('src/pages/TenderList.tsx', 'utf8');
if (!tenderCode.includes('Square,')) {
  tenderCode = tenderCode.replace('Mic,', 'Mic, Square,');
}
fs.writeFileSync('src/pages/TenderList.tsx', tenderCode, 'utf8');
