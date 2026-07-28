const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/src');
const SUPERADMIN_DIR = path.join(__dirname, 'frontend/superadmin/src');

// 1. Create config/api.js in both places
const apiConfigContent = `const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\\/$/, '');

export default API_BASE_URL;
`;

fs.mkdirSync(path.join(FRONTEND_DIR, 'config'), { recursive: true });
fs.writeFileSync(path.join(FRONTEND_DIR, 'config/api.js'), apiConfigContent);

fs.mkdirSync(path.join(SUPERADMIN_DIR, 'config'), { recursive: true });
fs.writeFileSync(path.join(SUPERADMIN_DIR, 'config/api.js'), apiConfigContent);

let modifiedCount = 0;

// 2. Refactor function
function refactorDir(dir, configPath) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            refactorDir(fullPath, configPath);
        } else if (file.isFile() && /\.(jsx?|tsx?)$/.test(file.name) && fullPath !== configPath) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // 1. let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            content = content.replace(/let\s+rawApiUrl\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:5000';/g, '');
            
            // replace rawApiUrl + '/api/v1' with `${API_BASE_URL}/api/v1`
            content = content.replace(/rawApiUrl\s*\+\s*['"`]\/api/g, '`${API_BASE_URL}/api');
            content = content.replace(/\$\{rawApiUrl\}\/api/g, '${API_BASE_URL}/api');

            // 2. const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;
            content = content.replace(/`\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}(\/api\/v1.*?)`/g, '`${API_BASE_URL}$1`');
            
            // 3. `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`
            content = content.replace(/\$\{window\.location\.hostname\s*===\s*'localhost'\s*\?\s*import\.meta\.env\.VITE_API_URL\s*\+\s*''\s*:\s*'https:\/\/family-hub-z48l\.onrender\.com'\}/g, '${API_BASE_URL}');
            
            // 4. window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'
            content = content.replace(/window\.location\.hostname\s*===\s*'localhost'\s*\?\s*import\.meta\.env\.VITE_API_URL\s*\+\s*''\s*:\s*'https:\/\/family-hub-z48l\.onrender\.com'/g, 'API_BASE_URL');
            
            // 5. import.meta.env.VITE_API_URL + '/api/v1...'
            content = content.replace(/import\.meta\.env\.VITE_API_URL\s*\+\s*['"`]\/api/g, '`${API_BASE_URL}/api');
            
            // 6. import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL + ''
            content = content.replace(/import\.meta\.env\.VITE_API_URL\s*\|\|\s*import\.meta\.env\.VITE_API_URL\s*\+\s*['"`]{2}/g, 'API_BASE_URL');

            // 7. `${import.meta.env.VITE_API_URL}/api`
            content = content.replace(/`\$\{import\.meta\.env\.VITE_API_URL\}\/api/g, '`${API_BASE_URL}/api');

            // 8. rawEnv || (window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '/api/v1' : 'https://family-hub-z48l.onrender.com/api/v1');
            content = content.replace(/let\s+rawEnv\s*=\s*import\.meta\.env\.VITE_API_URL;/g, '');
            content = content.replace(/rawEnv\s*\|\|\s*\(window\.location\.hostname\s*===\s*'localhost'\s*\?\s*import\.meta\.env\.VITE_API_URL\s*\+\s*'\/api\/v1'\s*:\s*'https:\/\/family-hub-z48l\.onrender\.com\/api\/v1'\)/g, '`${API_BASE_URL}/api/v1`');

            // If we replaced something, we need to add the import if it's not there
            if (content !== originalContent) {
                // Determine relative path to config/api.js
                const relPath = path.relative(path.dirname(fullPath), configPath).replace(/\\/g, '/');
                const importPath = relPath.startsWith('.') ? relPath : './' + relPath;
                
                const importStmt = `import API_BASE_URL from '${importPath.replace(/\.js$/, '')}';`;
                if (!content.includes('import API_BASE_URL')) {
                    // find last import
                    const lines = content.split('\n');
                    let lastImportIdx = -1;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith('import ')) lastImportIdx = i;
                    }
                    if (lastImportIdx !== -1) {
                        lines.splice(lastImportIdx + 1, 0, importStmt);
                    } else {
                        lines.unshift(importStmt);
                    }
                    content = lines.join('\n');
                }
                
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
                modifiedCount++;
            }
        }
    }
}

refactorDir(FRONTEND_DIR, path.join(FRONTEND_DIR, 'config/api.js'));
refactorDir(SUPERADMIN_DIR, path.join(SUPERADMIN_DIR, 'config/api.js'));

console.log(`Refactoring complete. Modified ${modifiedCount} files.`);
