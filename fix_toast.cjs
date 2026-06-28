const fs = require('fs');

function fixParentheses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix toast.something(bla;); -> toast.something(bla);
  content = content.replace(/(toast\.(?:success|error)\([^;]+);?\);/g, '$1);');

  // Actually, wait, it matched up to the first `)` inside `alert()`.
  // Wait, if it matched `alert("Err" + (err.message));`
  // `.*?` matches `("Err" + (err.message` because `)` follows. 
  // Then the rest `);` is left in the string!
  // So it became `toast.error("Err" + (err.message););`
  // Yes! The closing part `);` was left intact!
  // So we just replace `););` with `));` and `);.;` with `.something` ? No wait.

  // Let's replace any `toast.[success|error](...` where it ends with `););`
  content = content.replace(/\);\);/g, '));');
  
  // also wait, `\`);.;` ?? In line 572 it was:
  // toast.success(`Dépôt via ${depositMethod} enregistré. (Simulation réussie);.`);
  // Wait, no: `toast.success(\`Dépôt via ${depositMethod} enregistré. (Simulation réussie);\`.);`
  // Let me look at line 572
  

  fs.writeFileSync(filePath, content, 'utf8');
}

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(dirPath + "/" + file);
      }
    }
  });

  return arrayOfFiles;
};

const allFiles = getAllFiles('./src');
// allFiles.forEach(fixParentheses);
