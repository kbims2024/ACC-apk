import fs from 'fs';
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// We need to add a ref to the messages container and scroll to bottom on update.
if (code.includes('const replyMediaRecorderRef')) {
  code = code.replace(
    'const replyMediaRecorderRef = useRef<MediaRecorder | null>(null);',
    'const replyMediaRecorderRef = useRef<MediaRecorder | null>(null);\n  const chatScrollRef = useRef<HTMLDivElement>(null);'
  );
  
  code = code.replace(
    'useEffect(() => {\n    if (user && token) {',
    `useEffect(() => {\n    if (chatScrollRef.current) {\n      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;\n    }\n  }, [selectedRequest?.responses]);\n\n  useEffect(() => {\n    if (user && token) {`
  );
  
  code = code.replace(
    '<div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#efeae2] dark:bg-[#0b141a]">',
    '<div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#efeae2] dark:bg-[#0b141a]">'
  );
  
  fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
  console.log("Fixed scrolling.");
} else {
  console.log("Could not find anchor.");
}
