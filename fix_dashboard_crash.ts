import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldHeader = `              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 text-lg">
                {isWorker
                  ? selectedRequest.clientId
                    ? (selectedRequest.clientId.entityType === "company" && selectedRequest.clientId.companyName
                        ? selectedRequest.clientId.companyName
                        : selectedRequest.clientId.name).charAt(0).toUpperCase()
                    : selectedRequest.guestContact ? "I" : "?"
                  : (selectedRequest.workerId?.entityType === "company" && selectedRequest.workerId?.companyName
                      ? selectedRequest.workerId?.companyName
                      : selectedRequest.workerId?.name || "?").charAt(0).toUpperCase()}
              </div>`;

const newHeader = `              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 text-lg uppercase truncate">
                {isWorker
                  ? selectedRequest.clientId
                    ? String((selectedRequest.clientId as any).entityType === "company" && (selectedRequest.clientId as any).companyName
                        ? (selectedRequest.clientId as any).companyName
                        : (selectedRequest.clientId as any).name || "?").charAt(0)
                    : selectedRequest.guestContact ? "I" : "?"
                  : String((selectedRequest.workerId as any)?.entityType === "company" && (selectedRequest.workerId as any)?.companyName
                      ? (selectedRequest.workerId as any)?.companyName
                      : (selectedRequest.workerId as any)?.name || "?").charAt(0)}
              </div>`;

code = code.replace(oldHeader, newHeader);

// Let's also make sure we don't crash on the name:
const oldName = `                  {isWorker
                    ? selectedRequest.clientId
                      ? selectedRequest.clientId.entityType === "company" && selectedRequest.clientId.companyName
                        ? selectedRequest.clientId.companyName
                        : selectedRequest.clientId.name
                      : selectedRequest.guestContact ? \`Invité (\${selectedRequest.guestContact})\` : "Inconnu"
                    : selectedRequest.workerId?.entityType === "company" && selectedRequest.workerId?.companyName
                      ? selectedRequest.workerId?.companyName
                      : selectedRequest.workerId?.name || "Inconnu"}`;

const newName = `                  {isWorker
                    ? selectedRequest.clientId
                      ? (selectedRequest.clientId as any).entityType === "company" && (selectedRequest.clientId as any).companyName
                        ? (selectedRequest.clientId as any).companyName
                        : (selectedRequest.clientId as any).name || "Inconnu"
                      : selectedRequest.guestContact ? \`Invité (\${selectedRequest.guestContact})\` : "Inconnu"
                    : (selectedRequest.workerId as any)?.entityType === "company" && (selectedRequest.workerId as any)?.companyName
                      ? (selectedRequest.workerId as any)?.companyName
                      : (selectedRequest.workerId as any)?.name || "Inconnu"}`;

code = code.replace(oldName, newName);


fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
console.log('Fixed potential crash.');
