const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        results = results.concat(walk(filePath));
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
};

const frontendFiles = walk('c:/Users/nares/OneDrive/Desktop/Family/frontend');

let replacedCount = 0;
frontendFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace hardcoded localhost paths
  content = content.replace(/'http:\/\/localhost:5000/g, 'import.meta.env.VITE_API_URL + \'');
  content = content.replace(/"http:\/\/localhost:5000/g, 'import.meta.env.VITE_API_URL + "');
  content = content.replace(/`http:\/\/localhost:5000/g, '`${import.meta.env.VITE_API_URL}');
  
  // Specifically target the long ternary blocks like `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`
  content = content.replace(
      /window\.location\.hostname === 'localhost' \? 'http:\/\/localhost:5000' : 'https:\/\/family-hub-z48l\.onrender\.com'/g, 
      'import.meta.env.VITE_API_URL'
  );

  // Remove duplicate api/v1 segments since users sometimes included it in the replace chunk or left it out
  // The ternary replacement basically leaves `${import.meta.env.VITE_API_URL}/api/v1`. 

  if (content !== original) {
    fs.writeFileSync(file, content);
    replacedCount++;
  }
});

console.log(`Successfully replaced localhost URLs in ${replacedCount} files.`);
