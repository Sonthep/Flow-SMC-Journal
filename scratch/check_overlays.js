const fs = require('fs');
const src = fs.readFileSync('./node_modules/klinecharts/dist/umd/klinecharts.js', 'utf8');

// Find all "var <name> = { name: '<name>'," patterns which are overlay definitions
const matches = [...src.matchAll(/var\s+(\w+)\s*=\s*\{\s*name:\s*'([^']+)'/g)];
const overlayDefs = matches.filter(m => m[1] === m[2] || src.includes(`needDefaultPointFigure`));

// Better: find all name: 'xxx' near createPointFigures or totalStep
const nameMatches = [...src.matchAll(/name:\s*'([^']+)',\s*\n?\s*totalStep:/g)];
console.log('Overlay names (with totalStep):', nameMatches.map(m => m[1]).join(', '));

// Also search for "overlays[" or "overlays =" to see how they're registered
const overlayRegIdx = src.indexOf('overlays[');
const overlayRegSnippet = src.substring(overlayRegIdx, overlayRegIdx + 1000);
console.log('\nOverlay registration area:\n', overlayRegSnippet.substring(0, 800));
