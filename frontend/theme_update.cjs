const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'pages', 'member');

const replacements = [
  { regex: /dark:[a-zA-Z0-9\-\/:]+/g, replace: '' },
  { regex: /bg-slate-50/g, replace: 'bg-[#FCFBFF]' },
  { regex: /bg-gray-50/g, replace: 'bg-[#FCFBFF]' },
  { regex: /bg-slate-100/g, replace: 'bg-[#FAF8FF]' },
  { regex: /border-slate-100/g, replace: 'border-[#E9E5F8]' },
  { regex: /border-slate-200/g, replace: 'border-[#E9E5F8]' },
  { regex: /border-gray-200/g, replace: 'border-[#E9E5F8]' },
  { regex: /text-slate-900/g, replace: 'text-[#1F2430]' },
  { regex: /text-gray-900/g, replace: 'text-[#1F2430]' },
  { regex: /text-slate-800/g, replace: 'text-[#1F2430]' },
  { regex: /bg-blue-600/g, replace: 'bg-[#7C5CFC]' },
  { regex: /bg-indigo-600/g, replace: 'bg-[#7C5CFC]' },
  { regex: /bg-purple-600/g, replace: 'bg-[#7C5CFC]' },
  { regex: /bg-blue-500/g, replace: 'bg-[#7C5CFC]' },
  { regex: /bg-indigo-500/g, replace: 'bg-[#7C5CFC]' },
  { regex: /text-blue-600/g, replace: 'text-[#7C5CFC]' },
  { regex: /text-indigo-600/g, replace: 'text-[#7C5CFC]' },
  { regex: /text-blue-500/g, replace: 'text-[#7C5CFC]' },
  { regex: /border-blue-200/g, replace: 'border-[#7C5CFC]/20' },
  { regex: /border-indigo-200/g, replace: 'border-[#7C5CFC]/20' },
  { regex: /focus:border-blue-500/g, replace: 'focus:border-[#7C5CFC]' },
  { regex: /focus:ring-blue-500/g, replace: 'focus:ring-[#7C5CFC]' },
  { regex: /focus:border-indigo-500/g, replace: 'focus:border-[#7C5CFC]' },
  { regex: /focus:ring-indigo-500/g, replace: 'focus:ring-[#7C5CFC]' },
  { regex: /text-blue-700/g, replace: 'text-[#2E1E6B]' },
  { regex: /bg-blue-50/g, replace: 'bg-[#FAF8FF]' },
  { regex: /bg-indigo-50/g, replace: 'bg-[#FAF8FF]' },
  { regex: /rounded-xl/g, replace: 'rounded-[24px]' },
  { regex: /rounded-lg/g, replace: 'rounded-[20px]' },
  { regex: /shadow-md/g, replace: 'shadow-sm' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replace);
      }
      
      // ONLY clean up spaces inside className strings, do not touch the rest of the file
      content = content.replace(/className="([^"]+)"/g, (match, p1) => {
         let cleaned = p1.replace(/\s+/g, ' ').trim();
         return `className="${cleaned}"`;
      });
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
         let cleaned = p1.replace(/\s+/g, ' ').trim();
         return `className={\`${cleaned}\`}`;
      });

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

processDirectory(directory);
console.log('Migration complete.');
