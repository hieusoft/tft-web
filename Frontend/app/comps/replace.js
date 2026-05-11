const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'CompsClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/<img\s+(?![^>]*loading="lazy")/g, '<img loading="lazy" ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced all img tags successfully.');
