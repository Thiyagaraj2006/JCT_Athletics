const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = getFiles('./src');
let errors = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file);
      let targetPath = path.resolve(dir, importPath);
      
      // Check if file exists without extension
      let found = false;
      const exts = ['.js', '.jsx', '.css', ''];
      for (let ext of exts) {
        if (fs.existsSync(targetPath + ext)) {
          // Check exact case
          const exactDir = path.dirname(targetPath + ext);
          const exactBase = path.basename(targetPath + ext);
          try {
            const actualFiles = fs.readdirSync(exactDir);
            if (!actualFiles.includes(exactBase)) {
              errors.push(`Case mismatch in ${file}: imported '${importPath}' (resolves to ${exactBase}) but actual file might have different casing.`);
            }
          } catch(e) {}
          found = true;
          break;
        }
      }
    }
  }
});
if (errors.length > 0) {
  console.log(errors.join('\n'));
} else {
  console.log('No case mismatch found in local imports.');
}
