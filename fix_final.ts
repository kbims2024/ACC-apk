import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// replace all literal '\\n' with actual newline
dashboardCode = dashboardCode.replace(/\\\\n/g, '\\n');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
