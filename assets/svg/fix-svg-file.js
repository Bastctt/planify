const fs = require('fs');

const svgFile = process.argv[2];

if (!svgFile) {
  console.error('Utilisation : node fix-svg-colors.js fichier.svg');
  process.exit(1);
}

let content = fs.readFileSync(svgFile, 'utf-8');

content = content.replace(/rgb\(([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)%\)/g, (_, r, g, b) => {
  const rInt = Math.round(parseFloat(r) * 2.55);
  const gInt = Math.round(parseFloat(g) * 2.55);
  const bInt = Math.round(parseFloat(b) * 2.55);
  return `rgb(${rInt}, ${gInt}, ${bInt})`;
});

fs.writeFileSync(svgFile, content, 'utf-8');
console.log(`Correction effectuée pour : ${svgFile}`);
