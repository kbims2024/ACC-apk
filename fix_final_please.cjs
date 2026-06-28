const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace all literal \n strings with an actual newline
// In javascript string literal, '\\n' creates a string of length 2: a backslash and an n.
code = code.split('\\n').join('\n');

fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
