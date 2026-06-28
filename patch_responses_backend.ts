import fs from 'fs';

let content = fs.readFileSync('src/server/routes/requests.ts', 'utf8');

// Add more robust error logging.
content = content.replace(
  `} catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});`,
  `} catch (error: any) {
        console.error("Error in POST /:id/responses: ", error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});`
);

fs.writeFileSync('src/server/routes/requests.ts', content, 'utf8');
