import express from 'express';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { authenticateToken, optionalAuthenticateToken, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// Client: Create a request
router.post('/', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[DEBUG POST /api/requests] req.body:', req.body);
    console.log('[DEBUG POST /api/requests] authenticated user ID:', req.userId, 'role:', req.userRole);
    
    const { workerId, clientId: bodyClientId, serviceDetails, location, date, guestContact, audioData, contactMethod, tenderId, isWorkerInitiated } = req.body;
    
    let clientId = req.userId;
    let finalWorkerId = workerId;

    // If a worker is initiating the discussion towards a client explicitly
    if (isWorkerInitiated && req.userRole === "worker" && req.userId) {
      finalWorkerId = req.userId;
      clientId = bodyClientId;
    }

    console.log('[DEBUG POST /api/requests] resolved finalWorkerId:', finalWorkerId, 'clientId:', clientId);

    if (clientId) {
      const client = await User.findById(clientId);
      if (!client) {
        console.error('[DEBUG POST /api/requests] Client not found in database:', clientId);
        return res.status(404).json({ error: 'Client introuvable' });
      }
    } else if (!guestContact) {
      console.error('[DEBUG POST /api/requests] Missing guest contact or clientId');
      return res.status(400).json({ error: 'Vous devez fournir un moyen de contact (téléphone, etc.) ou vous connecter.' });
    }

    if (!finalWorkerId) {
      console.error('[DEBUG POST /api/requests] Missing workerId');
      return res.status(400).json({ error: 'Artisan ID requis.' });
    }

    // Prevent duplicate ServiceRequests for the same tender and worker and client
    if (tenderId && finalWorkerId && clientId) {
      const existing = await ServiceRequest.findOne({
        tenderId,
        workerId: finalWorkerId,
        clientId
      }).populate('clientId', 'name email photo phone profession entityType companyName')
        .populate('workerId', 'name email photo phone profession entityType companyName');
      
      if (existing) {
        console.log('[DEBUG POST /api/requests] Found existing duplicate request:', existing._id);
        return res.status(200).json(existing);
      }
    }

    const newRequest = new ServiceRequest({
      workerId: finalWorkerId,
      clientId: clientId || undefined,
      guestContact,
      serviceDetails,
      audioData,
      location: location || "Via demande de devis",
      contactMethod: contactMethod || 'app',
      date: date || new Date(),
      tenderId,
      workerUnreadCount: isWorkerInitiated ? 0 : 1,
      clientUnreadCount: isWorkerInitiated ? 1 : 0,
    });

    await newRequest.save();
    console.log('[DEBUG POST /api/requests] Successfully saved new request with ID:', newRequest._id);

    // Populate clientId to send real-time update
    const populatedRequest = await ServiceRequest.findById(newRequest._id)
      .populate('clientId', 'name email photo phone profession entityType companyName')
      .populate('workerId', 'name email photo phone profession entityType companyName');

    // Emit event to rooms
    const io = req.app.get('io');
    if (io) {
      const workerRoom = finalWorkerId.toString();
      io.to(workerRoom).emit('newRequest', populatedRequest);
      console.log(`[DEBUG POST /api/requests] Emitted 'newRequest' to worker room: ${workerRoom}`);
      if (clientId) {
        const clientRoom = clientId.toString();
        io.to(clientRoom).emit('newRequest', populatedRequest);
        console.log(`[DEBUG POST /api/requests] Emitted 'newRequest' to client room: ${clientRoom}`);
      }
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("DEBUG POST responses error:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user requests (worker or client)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        console.log('[DEBUG GET /api/requests] req.userId:', req.userId, 'req.userRole:', req.userRole);
        
        const filter = {
            $or: [
                { workerId: req.userId },
                { clientId: req.userId }
            ]
        };
        console.log('[DEBUG GET /api/requests] computed filter:', JSON.stringify(filter));
        
        const requests = await ServiceRequest.find(filter)
            .select('-audioData -responses.audioData -responses.attachmentUrl')
            .populate('clientId', 'name email photo phone profession entityType companyName')
            .populate('workerId', 'name email photo phone profession entityType companyName')
            .populate('tenderId')
            .sort({ createdAt: -1 });

        console.log('[DEBUG GET /api/requests] requests found total:', requests.length);
        res.json(requests);
    } catch (error) {
        console.error("[DEBUG GET /api/requests] Error occurred:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get single request details
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'name email photo phone profession entityType companyName')
            .populate('workerId', 'name email photo phone profession entityType companyName')
            .populate('tenderId')
            .lean();
            
        if (!request) return res.status(404).json({ error: 'Request not found' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Worker: Update request status
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { status } = req.body;
        
        const requestToCheck = await ServiceRequest.findById(req.params.id);
        if (!requestToCheck) return res.status(404).json({ error: 'Demande introuvable' });

        // Verify if user is either the client or the worker assigned
        if (requestToCheck.clientId.toString() !== req.userId && requestToCheck.workerId?.toString() !== req.userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const requestToUpdate = await ServiceRequest.findOneAndUpdate(
            { _id: req.params.id },
            { status },
            { new: true }
        ).populate('workerId', 'name email photo phone profession entityType companyName')
         .populate('tenderId');

        // Emit to the client and worker that their request was updated
        const io = req.app.get('io');
        if (io && requestToUpdate) {
            io.to(requestToUpdate.clientId.toString()).emit('requestUpdated', requestToUpdate);
            if (requestToUpdate.workerId) {
                io.to(requestToUpdate.workerId._id?.toString() || requestToUpdate.workerId.toString()).emit('requestUpdated', requestToUpdate);
            }
        }

        res.json(requestToUpdate);
    } catch (error: any) {
        console.error("Error in PUT /:id/status: ", error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

// Update direct agreement status
router.put('/:id/direct-agreement', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { action } = req.body;
        
        const request = await ServiceRequest.findById(req.params.id)
            .populate('workerId', 'name email photo phone profession entityType companyName')
            .populate('clientId', 'name email photo phone profession entityType companyName')
            .populate('tenderId');
            
        if (!request) return res.status(404).json({ error: 'Demande introuvable' });

        if (request.clientId._id.toString() !== req.userId && request.workerId?._id.toString() !== req.userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const isWorkerAction = request.workerId?._id.toString() === req.userId;

        if (action === 'accept') {
            if (!request.firstAcceptorId) {
                // First person accepts
                request.firstAcceptorId = req.userId;
                if (isWorkerAction) {
                    request.clientHasUnread = true;
                    request.clientUnreadCount = (request.clientUnreadCount || 0) + 1;
                } else {
                    request.workerUnreadCount = (request.workerUnreadCount || 0) + 1;
                }
                await request.save();
            } else if (request.firstAcceptorId.toString() !== req.userId) {
                // Second person accepts
                request.status = 'accepted';
                request.responses.push({
                    text: '[[SYS_DIRECT_AGREEMENT_REACHED]]',
                    senderId: req.userId,
                    createdAt: new Date()
                });
                if (isWorkerAction) {
                    request.clientHasUnread = true;
                    request.clientUnreadCount = (request.clientUnreadCount || 0) + 1;
                } else {
                    request.workerUnreadCount = (request.workerUnreadCount || 0) + 1;
                }
                await request.save();
            }
        } else if (action === 'decline') {
            if (request.firstAcceptorId) {
                // Second person declines
                request.firstAcceptorId = null;
                request.responses.push({
                    text: '[[SYS_DIRECT_AGREEMENT_DECLINED]]',
                    senderId: req.userId,
                    createdAt: new Date()
                });
                if (isWorkerAction) {
                    request.clientHasUnread = true;
                    request.clientUnreadCount = (request.clientUnreadCount || 0) + 1;
                } else {
                    request.workerUnreadCount = (request.workerUnreadCount || 0) + 1;
                }
                await request.save();
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.to(request.clientId._id.toString()).emit('requestUpdated', request);
            if (request.workerId) {
                io.to(request.workerId._id.toString()).emit('requestUpdated', request);
            }
        }

        res.json(request);
    } catch (error: any) {
        console.error("Error in PUT /:id/direct-agreement: ", error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

// Mark request as read for either worker or client
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const query: any = { _id: req.params.id };
        const update: any = {};

        if (req.userRole === 'worker') {
            query.workerId = req.userId;
            update.isRead = true;
            update.workerUnreadCount = 0;
        } else if (req.userRole === 'client') {
            query.clientId = req.userId;
            update.clientHasUnread = false;
            update.clientUnreadCount = 0;
        } else {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        
        const requestToUpdate = await ServiceRequest.findOneAndUpdate(
            query,
            update,
            { new: true }
        )
        .populate('clientId', 'name email photo phone profession entityType companyName')
        .populate('workerId', 'name email photo phone profession entityType companyName')
        .populate('tenderId');

        if (!requestToUpdate) return res.status(404).json({ error: 'Demande introuvable' });

        res.json(requestToUpdate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Add response to a request
router.post('/:id/responses', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { text, audioData, attachmentUrl } = req.body;
        const request = await ServiceRequest.findById(req.params.id);
        
        if (!request) return res.status(404).json({ error: 'Demande introuvable' });
        
        // Ensure user is involved in the request
        if (request.workerId.toString() !== req.userId && request.clientId?.toString() !== req.userId && (req as any).userRole !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const responseObj: any = {
            text,
            audioData,
            senderId: req.userId,
            createdAt: new Date()
        };

        if (attachmentUrl) {
            responseObj.attachmentUrl = attachmentUrl;
        }

        if (!request.responses) {
             request.responses = [];
        }
        request.responses.push(responseObj);

        // Update read flags depending on who sent the message
        if (req.userId === request.workerId.toString()) {
            request.clientHasUnread = true;
            request.clientUnreadCount = (request.clientUnreadCount || 0) + 1;
        } else if (request.clientId && req.userId === request.clientId.toString()) {
            request.isRead = false;
            request.workerUnreadCount = (request.workerUnreadCount || 0) + 1;
        }

        await request.save();

        const populatedRequest = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'name email photo phone profession entityType companyName')
            .populate('workerId', 'name email photo phone profession entityType companyName')
            .populate('tenderId')
            .lean();

        // Emit to both client and worker to ensure multi-device sync
        const io = req.app.get('io');
        if (io) {
            const workerIdStr = request.workerId._id ? request.workerId._id.toString() : request.workerId.toString();
            const clientIdStr = request.clientId ? (request.clientId._id ? request.clientId._id.toString() : request.clientId.toString()) : null;

            if (workerIdStr) io.to(workerIdStr).emit('requestUpdated', populatedRequest);
            if (clientIdStr) io.to(clientIdStr).emit('requestUpdated', populatedRequest);
        }

        res.status(201).json(populatedRequest);
    } catch (error: any) {
        console.error("DEBUG POST responses error:", error);
        res.status(500).json({ error: 'Erreur reponse serveur: ' + (error.message || 'unknown') });
    }
});

// Delete a response from a request
router.delete('/:reqId/responses/:resId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { reqId, resId } = req.params;
        const forEveryone = req.query.forEveryone === 'true';
        
        const request = await ServiceRequest.findById(reqId);
        if (!request) return res.status(404).json({ error: 'Demande introuvable' });
        
        const responseItem = request.responses.id(resId);
        if (!responseItem) return res.status(404).json({ error: 'Message introuvable' });
        
        // Ensure user is the sender to delete for everyone, or allow deleting for self regardless of sender
        if (forEveryone) {
            if (responseItem.senderId.toString() !== req.userId) {
                return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres messages pour tout le monde.' });
            }
            responseItem.deletedForEveryone = true;
            // Optionally, clear sensitive data
            responseItem.text = '';
            responseItem.audioData = '';
            responseItem.attachmentUrl = '';
        } else {
            // Delete for self
            if (!responseItem.deletedFor) {
                responseItem.deletedFor = [];
            }
            if (!responseItem.deletedFor.includes(req.userId as any)) {
                responseItem.deletedFor.push(req.userId as any);
            }
        }
        
        await request.save();
        
        const populatedRequest = await ServiceRequest.findById(reqId)
            .populate('clientId', 'name email photo phone profession entityType companyName')
            .populate('workerId', 'name email photo phone profession entityType companyName')
            .populate('tenderId');
            
        // Emit update to both users so UI refreshes
        const io = req.app.get('io');
        if (io) {
            if (request.clientId) {
                io.to(request.clientId.toString()).emit('requestUpdated', populatedRequest);
            }
            if (request.workerId) {
                 io.to(request.workerId.toString()).emit('requestUpdated', populatedRequest);
            }
        }
        
        res.json(populatedRequest);
    } catch (error: any) {
        console.error("DEBUG DELETE response error:", error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

// Delete a request
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const request = await ServiceRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: 'Demande introuvable' });
        }

        // Only allow client, worker or admin to delete the request
        if (
            request.clientId?.toString() !== req.userId &&
            request.workerId.toString() !== req.userId &&
            (req as any).userRole !== 'admin'
        ) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        await ServiceRequest.findByIdAndDelete(id);

        // Notify both parties that the request was deleted
        const io = req.app.get('io');
        if (io) {
            if (request.clientId) {
                io.to(request.clientId.toString()).emit('requestDeleted', id);
            }
            if (request.workerId) {
                io.to(request.workerId.toString()).emit('requestDeleted', id);
            }
        }

        res.json({ message: 'Demande supprimée avec succès' });
    } catch (error: any) {
        console.error("DEBUG DELETE request error:", error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

export default router;
