import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Use an actual newline character!
dashboardCode = dashboardCode.split('\\\\n').join('\\n');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
