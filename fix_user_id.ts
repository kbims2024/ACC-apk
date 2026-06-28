import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace `res.senderId === user._id` with `res.senderId === user?._id`
code = code.replace(/res\.senderId === user\._id/g, 'res.senderId === user?._id');

fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
console.log('Fixed potential crash on user._id');
