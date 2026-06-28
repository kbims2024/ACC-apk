const fs = require('fs');

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// replace literal "\" + "n" with actual newline
dashboardCode = dashboardCode.split('\\\\n').join('\n');

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
