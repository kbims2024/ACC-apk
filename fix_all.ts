import fs from 'fs';

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The string currently contains the characters '\' and 'n' literally.
// Let's replace the literal string '\\n' with the actual newline character '\n'.
dashboardCode = dashboardCode.split('\\\\n').join('\\n');

console.log(dashboardCode.substring(0, 50));

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
