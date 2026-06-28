import fs from 'fs';

let code = fs.readFileSync('src/pages/TenderList.tsx', 'utf8');

// Replace Quote form audio button
// We'll search for the block explicitly.

const quoteStart = code.indexOf('{isRecordingQuoteAudio ? (');
const quoteEnd = code.indexOf(')}', code.indexOf('Message vocal', quoteStart)) + 2;

if (quoteStart !== -1 && quoteEnd > quoteStart) {
  code = code.slice(0, quoteStart) +
    `<button type="button" onClick={isRecordingQuoteAudio ? stopQuoteAudioRecording : startQuoteAudioRecording} className={\`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition flex-shrink-0 \${isRecordingQuoteAudio ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f]"}\`}>\n  {isRecordingQuoteAudio ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}\n</button>` +
    code.slice(quoteEnd);
  console.log("Replaced quote audio button");
}

const createStart = code.lastIndexOf('{isRecording ? (');
const createEnd = code.indexOf(')}', code.indexOf('Message vocal', createStart)) + 2;

if (createStart !== -1 && createEnd > createStart) {
  code = code.slice(0, createStart) +
    `<button type="button" onClick={isRecording ? stopRecording : startRecording} className={\`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition flex-shrink-0 \${isRecording ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f]"}\`}>\n  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}\n</button>` +
    code.slice(createEnd);
  console.log("Replaced create tender audio button");
}

if (!code.includes('Square,')) {
  code = code.replace('Mic,', 'Mic, Square,');
}

fs.writeFileSync('src/pages/TenderList.tsx', code, 'utf8');
