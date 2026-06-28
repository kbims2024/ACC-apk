import fs from 'fs';

let code = fs.readFileSync('src/pages/WorkerProfile.tsx', 'utf8');

code = code.replace(
  'className={`absolute right-3 bottom-3 p-3 rounded-xl transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"}`}',
  'className={`absolute right-3 bottom-3 w-12 h-12 flex items-center justify-center rounded-full shadow-md transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f] text-white"}`}'
);

fs.writeFileSync('src/pages/WorkerProfile.tsx', code, 'utf8');
