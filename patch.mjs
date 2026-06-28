import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regex = /<button[^>]*onClick={\(\) => (set(Worker|Client)RequestFilter)\(\"([^\"]+)\"\)}[^>]*>[\s\S]*?<span className=\"mt-4 text-xs sm:text-sm ([^\"]+)\">[\s\S]*?Voir la liste[\s\S]*?<\/span>/gm;

let match;
let newCode = code;

while ((match = regex.exec(code)) !== null) {
  const fullMatch = match[0];
  const setFunc = match[1];
  const type = match[2];
  const filter = match[3];
  const classes = match[4];

  let requestsArrayLogic = '';
  let title = '';
  
  if (type === 'Worker') {
    if (filter === 'direct-all') { requestsArrayLogic = 'workerDirectRequests'; title = 'Toutes les sollicitations'; }
    else if (filter === 'direct-accepted') { requestsArrayLogic = 'workerDirectRequests.filter(r => r.status === \\'accepted\\')'; title = 'Sollicitations acceptées'; }
    else if (filter === 'direct-rejected') { requestsArrayLogic = 'workerDirectRequests.filter(r => r.status === \\'rejected\\')'; title = 'Sollicitations rejetées'; }
    else if (filter === 'direct-pending') { requestsArrayLogic = 'workerDirectRequests.filter(r => r.status === \\'pending\\')'; title = 'Sollicitations en cours'; }
    else if (filter === 'direct-completed') { requestsArrayLogic = 'workerDirectRequests.filter(r => r.status === \\'completed\\')'; title = 'Sollicitations terminées'; }
    
    else if (filter === 'tender-all') { requestsArrayLogic = 'workerTenderRequests'; title = 'Tous les devis'; }
    else if (filter === 'tender-accepted') { requestsArrayLogic = 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp: any) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status === \\'accepted\\' && a?.status === \\'accepted\\'; })'; title = 'Devis acceptés'; }
    else if (filter === 'tender-rejected') { requestsArrayLogic = 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp: any) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return a?.status === \\'declined\\'; })'; title = 'Devis rejetés'; }
    else if (filter === 'tender-pending') { requestsArrayLogic = 'workerTenderRequests.filter(r => { const a = r.responses?.find((resp: any) => String(resp.workerId?._id || resp.workerId) === String(user?._id)); return r.status !== \\'accepted\\' && r.status !== \\'completed\\' && a?.status !== \\'declined\\'; })'; title = 'Devis en cours'; }
  } else {
    if (filter === 'all') { requestsArrayLogic = 'requests'; title = 'Toutes les requêtes'; }
    else if (filter === 'direct-all') { requestsArrayLogic = 'clientDirectRequests'; title = 'Toutes les sollicitations'; }
    else if (filter === 'direct-accepted') { requestsArrayLogic = 'clientDirectRequests.filter(r => r.status === \\'accepted\\')'; title = 'Sollicitations acceptées'; }
    else if (filter === 'direct-rejected') { requestsArrayLogic = 'clientDirectRequests.filter(r => r.status === \\'rejected\\')'; title = 'Sollicitations refusées'; }
    else if (filter === 'direct-pending') { requestsArrayLogic = 'clientDirectRequests.filter(r => r.status === \\'pending\\')'; title = 'Sollicitations en attente'; }
    
    else if (filter === 'tender-received') { requestsArrayLogic = 'clientTenderRequests'; title = 'Devis reçus'; }
    else if (filter === 'tender-accepted') { requestsArrayLogic = 'clientTenderRequests.filter(r => r.status === \\'accepted\\')'; title = 'Devis validés'; }
    else if (filter === 'tender-consulted') { requestsArrayLogic = 'clientTenderRequests.filter(r => (r.responses && r.responses.length > 0))'; title = 'Devis consultés'; }
    else if (filter === 'tender-unconsulted') { requestsArrayLogic = 'clientTenderRequests.filter(r => !r.responses || r.responses.length === 0)'; title = 'Devis non consultés'; }
  }
  
  if (!requestsArrayLogic) continue;

  const replaceSpan = \`<span onClick={(e) => { e.stopPropagation(); setStatsListModalData({ title: "\${title}", requests: \${requestsArrayLogic} }); }} className="mt-4 text-xs sm:text-sm \${classes}">
                Voir la liste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
              </span>\`;
              
  const replacedFullMatch = fullMatch.replace(/<span className=\"mt-4 text-xs sm:text-sm [^\"]+\">[\s\S]*?Voir la liste[\s\S]*?<\/span>/, replaceSpan);
  
  newCode = newCode.replace(fullMatch, replacedFullMatch);
}

fs.writeFileSync('src/pages/Dashboard.tsx', newCode);
console.log('Replaced spans.');
