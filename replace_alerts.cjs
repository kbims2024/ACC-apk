const fs = require('fs');

function replaceAlerts(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('alert(')) return;
  if (!content.includes('react-hot-toast')) {
    const importMatch = content.match(/import.*from\s+['"]react['"];?/);
    if (importMatch) {
       content = content.replace(importMatch[0], importMatch[0] + '\nimport { toast } from "react-hot-toast";');
    } else {
       content = 'import { toast } from "react-hot-toast";\n' + content;
    }
  }

  // A very basic heuristic: 
  // if alert has "Erreur" or "Veuillez", replace with toast.error
  // else toast.success
  
  content = content.replace(/alert\((.*?)\);?/g, (match, p1) => {
    let type = 'success';
    const lower = p1.toLowerCase();
    if (lower.includes('erreur') || lower.includes('error') || lower.includes('veuillez') || lower.includes('obligatoire') || lower.includes('trop volumineux') || lower.includes('impossible') || lower.includes('pas encor') || lower.includes('invalide')) {
      type = 'error';
    }
    // For informational like clipboard
    if (lower.includes('copié') || lower.includes('succès') || lower.includes('merci') || lower.includes('enregistré')) {
      type = 'success';
    }
    
    // Fallback based on some keywords or default to success
    if (type === 'success' && lower.includes('attention')) {
      type = 'error';
    }
    
    return `toast.${type}(${p1});`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', filePath);
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
allFiles.forEach(replaceAlerts);
