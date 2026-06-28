import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const hookInsert = `
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedRequest?.responses]);
`;

code = code.replace(
  'const { settings } = useSettingsStore();',
  'const { settings } = useSettingsStore();\n' + hookInsert
);

fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
console.log('Fixed scroll effect');
