import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const modalStart = code.indexOf('{/* Details Modal */}');
const modalEnd = code.indexOf('{/* 2FA Choice Modal */}');

if (modalStart !== -1 && modalEnd !== -1) {
  const replacement = `{/* Details Modal */}
      {selectedRequest && (() => {
        // Safe access helpers to avoid runtime crashes
        const getParticipantName = (req: any, clientSide: boolean) => {
          if (clientSide) {
             if (req.clientId && req.clientId.entityType === 'company' && req.clientId.companyName) return req.clientId.companyName;
             if (req.clientId && req.clientId.name) return req.clientId.name;
             if (req.guestContact) return \`Invité (\${req.guestContact})\`;
             return "Client Inconnu";
          } else {
             if (req.workerId && req.workerId.entityType === 'company' && req.workerId.companyName) return req.workerId.companyName;
             if (req.workerId && req.workerId.name) return req.workerId.name;
             return "Artisan Inconnu";
          }
        };
        const safeDate = (d: any) => {
           if (!d) return "";
           try {
             return new Date(d).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
           } catch(e) { return ""; }
        };

        const otherName = isWorker ? getParticipantName(selectedRequest, true) : getParticipantName(selectedRequest, false);
        const otherInitial = otherName.charAt(0).toUpperCase();

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-900/40 sm:bg-slate-900/60 sm:backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full h-full sm:h-[90vh] sm:max-w-2xl md:max-w-3xl bg-[#efeae2] dark:bg-[#0b141a] sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 bg-white dark:bg-[#202c33] px-4 py-3 shadow-sm z-20">
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white rounded-full transition-colors flex sm:hidden"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold shrink-0 text-lg uppercase">
                {otherInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-[#e9edef] text-base leading-tight truncate">
                  {otherName}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight mt-0.5">
                  En ligne
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-[#aebac1] dark:hover:text-[#e9edef] p-2 rounded-full hidden sm:flex transition-colors"
                title="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#efeae2] dark:bg-[#0b141a]">
              {/* WhatsApp background pattern simulation */}
              <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://camo.githubusercontent.com/92ebacfb0f681a2da38e8ec88939c4c4dc8c9a3bf00fba681a7ce74fa49320b9/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')", backgroundSize: 'contain', backgroundRepeat: 'repeat' }} />
              
              <div className="relative z-10 flex flex-col space-y-4 max-w-4xl mx-auto w-full">
                
                {/* Information Callout */}
                <div className="flex justify-center">
                  <div className="bg-[#ffeecd] dark:bg-[#182229] border border-[#ffdd99] dark:border-[#202c33] text-[#543b16] dark:text-[#d1d7db] text-xs px-4 py-2 rounded-xl max-w-sm text-center shadow-sm">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                    <span className="font-medium">{selectedRequest.location || 'Localisation non spécifiée'}</span>
                  </div>
                </div>

                {/* The Original Request */}
                <div className={\`flex flex-col mb-4 \${!isWorker ? 'items-end' : 'items-start'}\`}>
                  <div className={\`max-w-[90%] md:max-w-[75%] p-2 rounded-2xl shadow-sm pb-1 flex flex-col \${!isWorker ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] rounded-tr-none' : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-none'}\`}>
                    
                    <div className="border-b border-black/5 dark:border-white/5 pb-1 mb-1">
                       <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Demande initiale</span>
                    </div>

                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap px-1 pt-1">{selectedRequest.serviceDetails || "Aucun détail"}</p>
                    
                    {selectedRequest.audioData && (
                      <div className="mt-2 w-full max-w-[280px]">
                        <audio src={selectedRequest.audioData} controls className="w-full h-10" />
                      </div>
                    )}
                    
                    {selectedRequest.attachmentUrl && (
                      <div className="mt-2 text-sm font-semibold underline">
                        {String(selectedRequest.attachmentUrl).startsWith('data:image') || String(selectedRequest.attachmentUrl).match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={selectedRequest.attachmentUrl} alt="Pièce jointe" className="mt-2 w-full max-w-xs rounded-xl border border-black/10 dark:border-white/10 object-cover" />
                        ) : (
                          <a href={selectedRequest.attachmentUrl} download="piece_jointe.pdf" className="flex items-center gap-1 opacity-90 hover:opacity-100">
                             <Paperclip className="w-4 h-4"/> Document joint
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-1 mt-1 opacity-60 px-1">
                      <span className="text-[10px]">{safeDate(selectedRequest.date)}</span>
                      {!isWorker && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>

                {/* Responses Map */}
                {(selectedRequest.responses || []).map((res: any, idx: number) => {
                  const isMe = res.senderId === user?._id;
                  return (
                    <div key={idx} className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'}\`}>
                      <div className={\`max-w-[90%] md:max-w-[75%] p-2 rounded-2xl shadow-sm pb-1 flex flex-col \${isMe ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] rounded-tr-none' : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-none'}\`}>
                        {res.text && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap px-1 pt-1">{res.text}</p>}
                        
                        {res.audioData && (
                          <div className="mt-2 w-full max-w-[280px]">
                            <audio src={res.audioData} controls className="w-full h-10" />
                          </div>
                        )}

                        {res.attachmentUrl && (
                          <div className="mt-2 text-sm font-semibold underline">
                            {String(res.attachmentUrl).startsWith('data:image') || String(res.attachmentUrl).match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                              <img src={res.attachmentUrl} alt="Jointe" className="mt-1 w-full max-w-xs rounded-xl border border-black/10 dark:border-white/10 object-cover" />
                            ) : (
                              <a href={res.attachmentUrl} download="piece_jointe.pdf" className="flex items-center gap-1 opacity-90 hover:opacity-100">
                                <Paperclip className="w-4 h-4"/> Document joint
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end items-center gap-1 mt-1 opacity-60 px-1">
                          <span className="text-[10px]">{safeDate(res.createdAt || selectedRequest.date)}</span>
                          {isMe && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Actions / Subscriptions Blocks */}
                {(!isWorker || (isWorker && user?.subscription?.activeUntil && new Date(user.subscription.activeUntil) >= new Date())) ? (
                  <div className="flex flex-col items-center mt-6 mb-2">
                    <div className="bg-white/80 dark:bg-[#202c33]/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 dark:border-[#2a3942] w-full max-w-md text-center shadow-sm">
                      <p className="text-[13px] font-medium text-slate-600 dark:text-[#8696a0] mb-3">Moyens de contact directs</p>
                      <div className="flex justify-center gap-4">
                        <a href={\`tel:\${isWorker ? selectedRequest.clientId?.phone || (selectedRequest.contactMethod === 'phone' ? selectedRequest.guestContact : '00') : selectedRequest.workerId?.phone || '00'}\`} className="p-3.5 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-full hover:bg-sky-200 transition"><Phone className="w-5 h-5" /></a>
                        <a href={\`https://wa.me/\${isWorker ? String(selectedRequest.clientId?.phone || (selectedRequest.contactMethod === 'whatsapp' ? selectedRequest.guestContact : '')).replace(/\\D/g, "") : String(selectedRequest.workerId?.phone || '').replace(/\\D/g, "")}\`} target="_blank" rel="noreferrer" className="p-3.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full hover:bg-emerald-200 transition"><MessageCircle className="w-5 h-5" /></a>
                        <a href={\`mailto:\${isWorker ? selectedRequest.clientId?.email || (selectedRequest.contactMethod === 'email' ? selectedRequest.guestContact : '') : selectedRequest.workerId?.email || ''}\`} className="p-3.5 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full hover:bg-amber-200 transition"><Mail className="w-5 h-5" /></a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mt-6 mb-2">
                    <div className="bg-[#ffeecd] dark:bg-[#202c33] p-4 rounded-xl border border-[#ffdd99] dark:border-[#2a3942] w-full max-w-md shadow-sm">
                      <h4 className="font-bold text-[#543b16] dark:text-[#d1d7db] mb-2 flex justify-center gap-2 text-[15px]"><AlertCircle className="w-4 h-4"/> Accès restreint</h4>
                      <p className="text-[13px] text-[#543b16]/80 dark:text-[#d1d7db]/80 mb-4 text-center">Renouvelez votre abonnement Pro pour voir les coordonnées de ce client.</p>
                      <button onClick={() => handleMockSubscribe("worker_quarterly", settings?.subscriptionPrices?.workerQuarterly || 5000)} className="w-full bg-[#00a884] hover:bg-[#029072] text-white font-bold py-3 rounded-xl transition text-[15px]">S'abonner ({(settings?.subscriptionPrices?.workerQuarterly || 5000).toLocaleString('fr-FR')} FCFA)</button>
                    </div>
                  </div>
                )}

                {isWorker && selectedRequest.status === "pending" && (
                  <div className="flex justify-center mt-2 mb-4">
                     <button onClick={() => {
                        if (!user?.subscription?.activeUntil || new Date(user.subscription.activeUntil) < new Date()) {
                          alert("Vous devez avoir un abonnement Pro actif pour accepter cette offre.");
                          return;
                        }
                        handleUpdateStatus(selectedRequest._id, "accepted");
                        setSelectedRequest(null);
                      }} className="bg-[#00a884] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#029072] transition shadow-lg flex items-center gap-2 text-[15px]">
                        <Check className="w-5 h-5" /> Accepter l'offre de travaux
                     </button>
                  </div>
                )}

                {!isWorker && selectedRequest.status === "completed" && (
                   <div className="flex justify-center mt-2 mb-4">
                     <button onClick={() => setShowReviewModal(true)} className="bg-amber-500 text-white font-bold px-8 py-3.5 rounded-full hover:bg-amber-600 transition shadow-lg flex items-center gap-2 text-[15px]">
                        <Star className="w-5 h-5 fill-current" /> Noter la prestation
                     </button>
                   </div>
                )}
              </div>
            </div>

            {/* Input Form Footer WhatsApp Style */}
            <form onSubmit={handleSubmitReply} className="bg-[#f0f2f5] dark:bg-[#202c33] px-2 py-2 sm:px-4 sm:py-3 w-full flex flex-col gap-2 relative z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              
              {/* Previews */}
              {replyAttachmentUrl && (
                <div className="flex items-center gap-2 bg-white dark:bg-[#111b21] p-2 rounded-xl shadow-sm border border-slate-200 dark:border-[#2a3942] w-fit">
                   <div className="text-xs font-bold text-slate-700 dark:text-[#d1d7db] flex items-center gap-2">
                      <Paperclip className="w-4 h-4"/> Fichier joint
                   </div>
                   <button type="button" onClick={() => setReplyAttachmentUrl(null)} className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><X className="w-4 h-4"/></button>
                </div>
              )}
              {replyAudioData && replyAudioUrl && (
                <div className="flex items-center gap-2 bg-white dark:bg-[#111b21] p-2 rounded-xl shadow-sm border border-slate-200 dark:border-[#2a3942]">
                  <audio src={replyAudioUrl} controls className="h-8 min-w-[200px]" />
                  <button type="button" onClick={clearRecordingReply} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shrink-0"><Trash2 className="w-5 h-5" /></button>
                </div>
              )}

              <div className="flex items-end gap-2 w-full max-w-4xl mx-auto">
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-3xl flex items-end shadow-sm border border-transparent dark:border-slate-700/50">
                  <label className="p-3 sm:p-3.5 text-slate-500 hover:text-slate-700 dark:text-[#8696a0] dark:hover:text-[#d1d7db] cursor-pointer rounded-l-3xl transition flex-shrink-0">
                    <Paperclip className="w-6 h-6" />
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReplyFileUpload} />
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Message"
                    className="flex-1 bg-transparent py-3 sm:py-3.5 px-1 max-h-32 resize-none outline-none text-[#111b21] dark:text-[#e9edef] text-[16px] placeholder-slate-400 dark:placeholder-[#8696a0]"
                    rows={1}
                    style={{ minHeight: "48px" }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim() || replyAudioData || replyAttachmentUrl) handleSubmitReply(e as any);
                      }
                    }}
                  />
                  <div className="p-2 flex-shrink-0">
                     {/* spacing for symmetric look */}
                  </div>
                </div>

                <div className="flex-shrink-0 mb-[2px]">
                  {(replyText.trim() || replyAudioData || replyAttachmentUrl) ? (
                    <button type="submit" disabled={isSubmittingReply} className="w-12 h-12 bg-[#00a884] items-center justify-center rounded-full text-white hover:bg-[#029072] active:scale-95 shadow-md transition-all flex flex-shrink-0">
                      {isSubmittingReply ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5 ml-1" />}
                    </button>
                  ) : (
                    <button type="button" onClick={isRecordingReply ? handleStopRecordingReply : handleStartRecordingReply} className={\`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-md active:scale-95 transition-all flex-shrink-0 \${isRecordingReply ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#029072]"}\`}>
                       {isRecordingReply ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
        );
      })}
      
      {/* 2FA Choice Modal */}`;

  code = code.slice(0, modalStart) + replacement + code.slice(modalEnd + 24);
  fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
}
