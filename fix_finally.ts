import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace string "\n" with an actual newline "\n"
// The string we are looking for is exactly "\" followed by "n"
dashboardCode = dashboardCode.replace(/\\\\n/g, '\n');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
