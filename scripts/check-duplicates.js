const fs = require('fs');

const content = fs.readFileSync('skills/SDI.md', 'utf8');
const ids = new Set();
const regex = /"id":\s*"([^"]+)"/g;
let match;
const dups = [];

while ((match = regex.exec(content)) !== null) {
  if (ids.has(match[1])) {
    dups.push(match[1]);
  }
  ids.add(match[1]);
}

console.log('Total unique IDs:', ids.size);
console.log('Duplicates:', dups.length > 0 ? dups.join(', ') : 'None');
