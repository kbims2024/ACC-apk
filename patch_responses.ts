import fs from 'fs';

let content = fs.readFileSync('src/server/routes/requests.ts', 'utf8');

content = content.replace(
  `        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});`,
  `        res.status(201).json(populatedRequest);
    } catch (error: any) {
        console.error("DEBUG POST responses error:", error);
        res.status(500).json({ error: 'Erreur reponse serveur: ' + (error.message || 'unknown') });
    }
});`
);
// Also fix the model if responses array does not exist or ServiceRequest is missing responses init
content = content.replace(
  `const request: any = new ServiceRequest({`,
  `const request: any = new ServiceRequest({
            responses: [],`
);

fs.writeFileSync('src/server/routes/requests.ts', content, 'utf8');
