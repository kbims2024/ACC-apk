import fs from 'fs';

let content = fs.readFileSync('src/server/routes/requests.ts', 'utf8');

content = content.replace(
  `        if (attachmentUrl) {
            responseObj.attachmentUrl = attachmentUrl;
        }

        request.responses.push(responseObj);`,
  `        if (attachmentUrl) {
            responseObj.attachmentUrl = attachmentUrl;
        }

        if (!request.responses) {
             request.responses = [];
        }
        request.responses.push(responseObj);`
);

fs.writeFileSync('src/server/routes/requests.ts', content, 'utf8');
