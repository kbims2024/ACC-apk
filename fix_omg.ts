import fs from 'fs';
let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The string literal for a backslash is "\\", and "n" is just "n".
// So "\\n" creates a string with exactly two characters: backslash, then n.
// Which is exactly what's currently in the file.
dashboardCode = dashboardCode.split('\\n').join('\n');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
