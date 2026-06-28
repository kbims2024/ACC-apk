import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  'const isMe = res.senderId === user?._id;',
  'const isMe = String(res.senderId) === String(user?._id);'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
console.log('Fixed isMe comparing id');
