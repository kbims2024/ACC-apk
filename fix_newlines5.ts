import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

let lines = dashboardCode.split('\\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const chatScrollRef = useRef<HTMLDivElement>(null);')) {
    lines[i] = '  const chatScrollRef = useRef<HTMLDivElement>(null);';
  }
}

dashboardCode = lines.join('\\n');

let hookInsert = '\\n  useEffect(() => {\\n    if (chatScrollRef.current) {\\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\\n    }\\n  }, [selectedRequest?.responses]);\\n';

dashboardCode = dashboardCode.replace(
  'const chatScrollRef = useRef<HTMLDivElement>(null);',
  'const chatScrollRef = useRef<HTMLDivElement>(null);' + hookInsert
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
