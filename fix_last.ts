import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
code = code.split('\\n').join('\n');
fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');

// I also generated fix_remaining.cjs which has linter errors, I will delete it.
try { fs.unlinkSync('fix_remaining.cjs'); } catch(e){}
