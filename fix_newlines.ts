import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashboardCode = dashboardCode.replace(
  'const chatScrollRef = useRef<HTMLDivElement>(null);\\n  useEffect(() => {\\n    if (chatScrollRef.current) {\\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\\n    }\\n  }, [selectedRequest?.responses]);\\n',
  'const chatScrollRef = useRef<HTMLDivElement>(null);\\n\\n  useEffect(() => {\\n    if (chatScrollRef.current) {\\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\\n    }\\n  }, [selectedRequest?.responses]);\\n'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
