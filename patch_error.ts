import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(
  'if (!res.ok) throw new Error("Erreur");\n      const updatedData = await res.json();\n      setRequests((prev) => prev.map((r) => (r._id === selectedRequest._id ? updatedData : r)));\n      setSelectedRequest(updatedData);\n      setReplyText("");\n      clearRecordingReply();\n      setReplyAttachmentUrl(null);\n    } catch (error) {\n      console.error(error);\n      alert("Erreur lors de l\'envoi de la r\u00e9ponse.");\n    } finally {',
  `if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur du serveur");
      }
      const updatedData = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === selectedRequest._id ? updatedData : r)));
      setSelectedRequest(updatedData);
      setReplyText("");
      clearRecordingReply();
      setReplyAttachmentUrl(null);
    } catch (error: any) {
      console.error(error);
      alert("Erreur: " + error.message);
    } finally {`
);
fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
