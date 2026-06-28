import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The file is currently messed up with literal '\\n' instead of actual newlines.
// It might be completely on one line now.
// Let's replace literal '\\n' with actual newlines.
dashboardCode = dashboardCode.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
