const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const newContent = content.replace(/className=(?:\"([^\"]*)\"|\'([^\']*)\'|\{\`([^\`]*)\`\})/g, (match, p1, p2, p3) => {
    let q = match.startsWith('className="') ? '"' : match.startsWith('className=\'') ? '\'' : '{\`';
    let endQ = match.endsWith('}') ? '\`}' : q;
    let classesStr = p1 || p2 || p3 || '';
    if (!classesStr) return match;

    const classes = classesStr.split(/\s+/);
    let hasBlueText = false;
    
    // Check if it has text-brand-X
    for (const c of classes) {
      if (/^text-brand-\d+$/.test(c)) {
        hasBlueText = true;
      }
    }

    if (hasBlueText) {
      // Remove any existing dark:text-brand-X
      let newClasses = classes.filter(c => !/^dark:text-brand-\d+$/.test(c));
      
      // Check if it already has a dark:text-accent-X
      if (!newClasses.some(c => /^dark:text-accent-\d+$/.test(c))) {
         newClasses.push('dark:text-accent-400');
         changed = true;
      } else if (classes.length !== newClasses.length) {
         changed = true;
      }
      return match.replace(classesStr, newClasses.join(' '));
    }
    return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
