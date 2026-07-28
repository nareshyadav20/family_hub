const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/src');
const SUPERADMIN_DIR = path.join(__dirname, 'frontend/superadmin/src');

function fixQuotes(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            fixQuotes(fullPath);
        } else if (file.isFile() && /\.(jsx?|tsx?)$/.test(file.name)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Find `${API_BASE_URL}... ' or " and replace the closing quote with a backtick
            // For example: `${API_BASE_URL}/api/v1' -> `${API_BASE_URL}/api/v1`
            content = content.replace(/`\$\{API_BASE_URL\}([^'`"]*)['"]/g, '`${API_BASE_URL}$1`');
            
            // Fix services/api.js specifically if it's messed up differently
            content = content.replace(/`\$\{API_BASE_URL\}\/api\/v1'\s*:\s*'https:\/\/family-hub-z48l\.onrender\.com\/api\/v1'\)/g, '`${API_BASE_URL}/api/v1`)');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed syntax error in', fullPath);
            }
        }
    }
}

fixQuotes(FRONTEND_DIR);
fixQuotes(SUPERADMIN_DIR);
