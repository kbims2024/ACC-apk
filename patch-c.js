const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const mapping = {
  'direct-all': { worker: 'workerDirectRequests', client: 'clientDirectRequests', tW: 'Toutes les sollicitations', tC: 'Toutes les sollicitations' },
  'direct-accepted': { worker: 'workerDirectRequests.filter(r => r.status === "accepted")', client: 'clientDirectRequests.filter(r => r.status === "accepted")', tW: 'Sollicitations acceptées', tC: 'Sollicitations acceptées'},
  'direct-rejected': { worker: 'workerDirectRequests.filter(r => r.status === "rejected")', client: 'clientDirectRequests.filter(r => r.status === "rejected")', tW: 'Sollicitations rejetées', tC: 'Sollicitations refusées'},
  'direct-pending': { worker: 'workerDirectRequests.filter(r => r.status === "pending")', client: 'clientDirectRequests.filter(r => r.status === "pending")', tW: 'Sollicitations en cours', tC: 'Sollicitations en attente'},
  'direct-completed': { worker: 'workerDirectRequests.filter(r => r.status === "completed")', client: '', tW: 'Sollicitations terminées', tC: ''},
  'tender-all': { worker: 'workerTenderRequests', client: '', tW: 'Tous les devis', tC: '' },
  'tender-accepted': { worker: 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status === "accepted" && a?.status === "accepted"; })', client: 'clientTenderRequests.filter(r => r.status === "accepted")', tW: 'Devis acceptés', tC: 'Devis validés' },
  'tender-rejected': { worker: 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return a?.status === "declined"; })', client: '', tW: 'Devis rejetés', tC: '' },
  'tender-pending': { worker: 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status !== "accepted" && r.status !== "completed" && a?.status !== "declined"; })', client: '', tW: 'Devis en cours', tC: '' },
  'tender-received': { worker: '', client: 'clientTenderRequests', tW: '', tC: 'Devis reçus' },
  'tender-consulted': { worker: '', client: 'clientTenderRequests.filter(r => (r.responses && r.responses.length > 0))', tW: '', tC: 'Devis consultés' },
  'tender-unconsulted': { worker: '', client: 'clientTenderRequests.filter(r => !r.responses || r.responses.length === 0)', tW: '', tC: 'Devis non consultés' },
  'all': { worker: '', client: 'requests', tW: '', tC: 'Toutes les requêtes' }
};

const regex = /<button[^>]*onClick={\(\) => set(Worker|Client)RequestFilter\(\"([^\"]+)\"\)}[^>]*>[\s\S]*?<span className=\"mt-4 text-xs sm:text-sm ([^\"]+)\">[\s\S]*?Voir la liste[\s\S]*?<\/span>/g;

let newCode = code.replace(regex, (match, type, filter, classes) => {
  const m = mapping[filter];
  if (!m) return match;
  
  const reqStr = type === 'Worker' ? m.worker : m.client;
  const tStr = type === 'Worker' ? m.tW : m.tC;
  if (!reqStr) return match;
  
  const replaceSpan = \`<span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "\${tStr}", requests: \${reqStr} }); }} className="mt-4 text-xs sm:text-sm \${classes}">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>\`;
              
  return match.replace(/<span className=\"mt-4 text-xs sm:text-sm [^\"]+\">[\s\S]*?Voir la liste[\s\S]*?<\/span>/, replaceSpan);
});

fs.writeFileSync('src/pages/Dashboard.tsx', newCode);
console.log('Replaced successfully.');
