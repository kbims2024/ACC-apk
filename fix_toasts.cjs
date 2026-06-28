const fs = require('fs');

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

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('toast.success(err.message)') || content.includes('toast.success(error.message)') || content.includes('toast.success(') || content.includes('toast.error(')) {
    content = content.replace(/toast\.success\((err\.message|error\.message)\)/g, 'toast.error($1)');
    content = content.replace(/toast\.success\([^)]*insuffisant[^)]*\)/ig, match => match.replace('success', 'error'));
    content = content.replace(/toast\.success\([^)]*taille de l'image[^)]*\)/ig, match => match.replace('success', 'error'));
    content = content.replace(/toast\.success\([^)]*e doit pas dépasser[^)]*\)/ig, match => match.replace('success', 'error'));
    content = content.replace(/toast\.error\([^)]*succès[^)]*\)/ig, match => match.replace('error', 'success'));
    content = content.replace(/toast\.success\([^)]*rreur[^)]*\)/ig, match => match.replace('success', 'error'));
    
    // Some that might have missed
    content = content.replace(/toast\.success\(err\.error\)/g, 'toast.error(err.error)');
    content = content.replace(/toast\.success\(data\.error\)/g, 'toast.error(data.error)');

    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ', file);
  }
});
