const fs = require('fs');
const path = require('path');

const filesToFix = [
  { file: 'src/pages/shared/Chat.jsx', rel: '../../config' },
  { file: 'src/pages/public/Leaderboard.jsx', rel: '../../config' },
  { file: 'src/pages/public/Home.jsx', rel: '../../config' },
  { file: 'src/pages/public/About.jsx', rel: '../../config' },
  { file: 'src/pages/player/Profile.jsx', rel: '../../config' },
  { file: 'src/pages/coach/CoachSubmissions.jsx', rel: '../../config' },
  { file: 'src/pages/admin/Settings.jsx', rel: '../../config' },
  { file: 'src/pages/admin/ManagePlayers.jsx', rel: '../../config' },
  { file: 'src/pages/admin/ManageCoaches.jsx', rel: '../../config' },
  { file: 'src/components/Avatar.jsx', rel: '../config' }
];

filesToFix.forEach(({ file, rel }) => {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('import { API_BASE_URL }')) {
      const importStatement = `import { API_BASE_URL } from '${rel}';\n`;
      
      // Find the last import
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, importStatement);
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Fixed ${file}`);
      } else {
        fs.writeFileSync(filePath, importStatement + content);
        console.log(`Fixed ${file} (added at top)`);
      }
    }
  }
});
