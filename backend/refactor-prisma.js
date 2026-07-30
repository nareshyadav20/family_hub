const fs = require('fs');
const path = require('path');

const targetStr = "const prisma = new PrismaClient();";
// We want to replace it, and we might need to remove `const { PrismaClient } = require('@prisma/client');` 
// but it's safer to just replace `const prisma = new PrismaClient();` with importing the singleton.
const replacement = "const prisma = require('../prismaClient');";

function searchAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== 'prisma') {
            searchAndReplace(fullPath);
        } else if (file.endsWith('.js') && file !== 'node_modules' && file !== 'prismaClient.js' && file !== 'refactor-prisma.js' && file !== 'bulk-fix-tokens.js') {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            if (content.includes('const prisma = new PrismaClient();')) {
                // Determine relative path to prismaClient.js
                const depth = path.relative(dir, __dirname).split(path.sep).length;
                let relPath = './prismaClient';
                if (dir !== __dirname) {
                    const upDirs = path.relative(dir, __dirname).replace(/\\/g, '/');
                    relPath = `${upDirs}/prismaClient`;
                }
                content = content.replace(/const prisma = new PrismaClient\(\);/g, `const prisma = require('${relPath}');`);
                // Optional: remove const { PrismaClient } = require('@prisma/client');
                content = content.replace(/const \{ PrismaClient \} = require\('@prisma\/client'\);\s*/g, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

searchAndReplace(__dirname);
console.log("Done");
