const fs = require('fs');
const path = require('path');

const targetStr1 = "res.status(401).json({ error: 'Family ID missing' });";
const replacement1 = "res.status(401).json({ error: 'Family ID missing' });";

const targetStr2 = "res.status(401).json({ error: 'Family ID missing from user session' });";
const replacement2 = "res.status(401).json({ error: 'Family ID missing from user session' });";

function searchAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules') {
            searchAndReplace(fullPath);
        } else if (file.endsWith('.js') && file !== 'node_modules') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(targetStr1) || content.includes(targetStr2)) {
                content = content.replaceAll(targetStr1, replacement1);
                content = content.replaceAll(targetStr2, replacement2);
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

searchAndReplace(__dirname);
console.log("Done");
