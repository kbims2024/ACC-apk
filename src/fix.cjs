const fs = require('fs');

let content = fs.readFileSync('src/pages/TenderList.tsx', 'utf8');

// Find start of Client Statistics Area
const start1 = content.indexOf('{/* Client Statistics Area */}');
const end1 = content.indexOf('{/* Quote Form */}');

if (start1 !== -1 && end1 !== -1) {
    content = content.substring(0, start1) + content.substring(end1);
} else {
    console.log("Could not find block 1");
}

// Find start of Responses List
const start2 = content.indexOf('{/* Responses List');
const end2 = content.indexOf('                </motion.div>\n              ))}');

if (start2 !== -1 && end2 !== -1) {
    content = content.substring(0, start2) + content.substring(end2);
} else {
    console.log("Could not find block 2");
}

fs.writeFileSync('src/pages/TenderList.tsx', content);
console.log("Done");
