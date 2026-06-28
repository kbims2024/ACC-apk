import express from "express";
import { PublicTender } from "../models/PublicTender.js";
import { ServiceRequest } from "../models/ServiceRequest.js";
import { authenticateToken } from "../middleware/auth.js";
import { AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Get all open tenders
router.get("/", async (req, res) => {
  try {
    const tenders = await PublicTender.find({ status: "open" })
      .populate("clientId", "name photo phone entityType companyName")
      .populate(
        "responses.workerId",
        "name photo phone profession entityType companyName",
      )
      .sort({ createdAt: -1 });
    res.json(tenders);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Create a tender
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, location, audioData, attachmentUrl } = req.body;

    // Authenticated client creates a tender
    const clientId = req.userId;

    const generatedTenderId = `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newTender = new PublicTender({
      tenderId: generatedTenderId,
      clientId,
      title,
      description,
      audioData,
      attachmentUrl,
      location,
    });

    await newTender.save();
    res.status(201).json(newTender);
  } catch (err) {
    console.error("Tender creation error:", err);
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
});

// Propose a quote
router.post(
  "/:id/responses",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { text, price, attachmentUrl, audioUrl } = req.body;
      if (req.userRole !== "worker") {
        return res
          .status(403)
          .json({ error: "Seuls les artisans peuvent proposer un devis" });
      }

      const tender = await PublicTender.findById(req.params.id);
      if (!tender)
        return res.status(404).json({ error: "Demande de devis introuvable" });

      if (tender.status !== "open") {
        return res
          .status(400)
          .json({ error: "Cette demande de devis n'est plus ouverte" });
      }

      // Check if already responded
      const alreadyResponded = tender.responses.some(
        (r: any) => r.workerId.toString() === req.userId,
      );
      if (alreadyResponded) {
        return res
          .status(400)
          .json({ error: "Vous avez déjà proposé un devis" });
      }

      tender.responses.push({
        workerId: req.userId,
        text,
        price,
        attachmentUrl,
        audioUrl,
      });

      await tender.save();

      if (tender.clientId) {
        let reqInstance = await ServiceRequest.findOne({
          workerId: req.userId,
          clientId: tender.clientId,
          tenderId: tender._id,
        });

        if (reqInstance) {
          reqInstance.responses.push({
            text: `Suite à votre demande de devis "${tender.title}", je vous propose un devis à ${price} FCFA.\n\nMessage : ${text}`,
            senderId: req.userId,
            createdAt: new Date(),
          });
          if (audioUrl) {
            reqInstance.responses[reqInstance.responses.length - 1].audioData = audioUrl;
          }
          if (attachmentUrl) {
            reqInstance.responses[reqInstance.responses.length - 1].attachmentUrl = attachmentUrl;
          }
          reqInstance.status = "pending";
          reqInstance.clientHasUnread = true;
          reqInstance.clientUnreadCount = (reqInstance.clientUnreadCount || 0) + 1;
          await reqInstance.save();
        } else {
          reqInstance = new ServiceRequest({
            workerId: req.userId,
            clientId: tender.clientId,
            tenderId: tender._id,
            serviceDetails: `Suite à votre demande de devis "${tender.title}", je vous propose un devis à ${price} FCFA.\n\nMessage : ${text}`,
            location: tender.location,
            date: new Date(),
            status: "pending",
            clientHasUnread: true,
            clientUnreadCount: 1,
            audioData: audioUrl,
            attachmentUrl: attachmentUrl
          });
          await reqInstance.save();
        }

        const populatedNewReq = await ServiceRequest.findById(reqInstance._id)
          .populate(
            "clientId",
            "name email photo phone profession entityType companyName",
          )
          .populate(
            "workerId",
            "name email photo phone profession entityType companyName",
          );

        const io = req.app.get("io");
        if (io) {
          io.to(tender.clientId.toString()).emit(reqInstance.isNew ? "newRequest" : "requestUpdated", populatedNewReq);
        }
      }

      const populated = await PublicTender.findById(tender._id)
        .populate("clientId", "name photo phone entityType companyName")
        .populate(
          "responses.workerId",
          "name photo phone profession entityType companyName",
        );

      // Optional socket io emit
      const io = req.app.get("io");
      if (io) {
        io.emit("tenderResponse", populated);
      }

      res.json(populated);
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  },
);

// Accept a quote
router.post("/:id/accept", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { workerId } = req.body;
    const tender = await PublicTender.findById(req.params.id);
    if (!tender)
      return res.status(404).json({ error: "Demande de devis introuvable" });

    if (tender.clientId && tender.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    tender.status = "accepted";
    tender.acceptedWorkerId = workerId;
    await tender.save();

    const populated = await PublicTender.findById(tender._id)
      .populate("clientId", "name photo phone entityType companyName")
      .populate(
        "responses.workerId",
        "name photo phone profession entityType companyName",
      );

    // Find existing service request for this tender and worker
    try {
      let existingRequest = await ServiceRequest.findOne({
        tenderId: tender._id,
        workerId: workerId,
        clientId: req.userId,
      });

      if (existingRequest) {
        existingRequest.status = "accepted";
        existingRequest.responses.push({
          text: "🎉🥳 Félicitations !\nVotre offre vient d'être acceptée par le client.\n🚀 Vous avez remporté cette mission !\nConsultez vos messages pour organiser la suite du projet.",
          senderId: req.userId,
          createdAt: new Date(),
        });

        existingRequest.isRead = false;
        existingRequest.workerUnreadCount =
          (existingRequest.workerUnreadCount || 0) + 1;

        await existingRequest.save();

        const reqPopulated = await ServiceRequest.findById(existingRequest._id)
          .populate("clientId", "name photo phone entityType companyName")
          .populate(
            "workerId",
            "name photo phone profession entityType companyName",
          )
          .populate("tenderId", "title status");

        const io = req.app.get("io");
        if (io) {
          io.to(workerId).emit("requestUpdated", reqPopulated);
          io.to(req.userId).emit("requestUpdated", reqPopulated);
        }
      } else {
        const acceptedQuote = tender.responses?.find(
          (r: any) => r.workerId.toString() === workerId,
        );
        const newRequest = new ServiceRequest({
          clientId: req.userId,
          workerId: workerId,
          tenderId: tender._id,
          status: "accepted",
          serviceDetails: `[Demande de devis: ${tender.title}]\n\n${tender.description}\n\nDevis retenu: ${acceptedQuote?.price || 0} FCFA\nInfos devis: ${acceptedQuote?.text || "Aucune précision"}\nCe chantier vous a été attribué suite à l'acceptation de votre devis sur la plateforme.`,
          location: tender.location,
          date: new Date(),
          attachmentUrl: acceptedQuote?.attachmentUrl || tender.attachmentUrl,
          audioData: acceptedQuote?.audioUrl || tender.audioData,
        });
        await newRequest.save();

        const reqPopulated = await ServiceRequest.findById(newRequest._id)
          .populate("clientId", "name photo phone entityType companyName")
          .populate(
            "workerId",
            "name photo phone profession entityType companyName",
          )
          .populate("tenderId", "title status");

        const io = req.app.get("io");
        if (io) {
          io.to(workerId).emit("newRequest", reqPopulated);
        }
      }
    } catch (e) {
      console.error(
        "Erreur lors de la mise à jour de la requête liée à l'appel d'offre:",
        e,
      );
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("tenderAccepted", populated);
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

// Get user's own tenders
router.get("/my-tenders", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tenders = await PublicTender.find({ clientId: req.userId })
      .populate("clientId", "name photo phone entityType companyName")
      .populate(
        "responses.workerId",
        "name photo phone profession entityType companyName",
      )
      .sort({ createdAt: -1 });
    res.json(tenders);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mark a quote response as read / consulted
router.post(
  "/:id/responses/:responseId/read",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const tender = await PublicTender.findById(req.params.id);
      if (!tender) {
        return res.status(404).json({ error: "Demande de devis introuvable" });
      }

      if (tender.clientId && tender.clientId.toString() !== req.userId) {
        return res.status(403).json({ error: "Non autorisé" });
      }

      const response = tender.responses.find(
        (r: any) => r._id.toString() === req.params.responseId,
      );

      if (response) {
        response.isConsulted = true;
        await tender.save();
      }

      const populated = await PublicTender.findById(tender._id)
        .populate("clientId", "name photo phone entityType companyName")
        .populate(
          "responses.workerId",
          "name photo phone profession entityType companyName",
        );

      res.json(populated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur" });
    }
  },
);

export default router;
