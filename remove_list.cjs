const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startStr = "      {(!isWorker || workerRequestFilter !== \"none\") && (";
const endStr = "        {/* Danger Zone */}";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const finalContent = content.substring(0, startIdx) + content.substring(endIdx);
    fs.writeFileSync('src/pages/Dashboard.tsx', finalContent);
    console.log("Successfully removed the inline list block.");
} else {
    console.log("Could not find start or end string.", { startIdx, endIdx });
}
