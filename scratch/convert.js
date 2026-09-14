const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.resolve(__dirname, '../reseñas');
const files = fs.readdirSync(inputDir);

async function inspect() {
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const meta = await sharp(filePath).metadata();
    console.log(file + ': ' + meta.width + 'x' + meta.height + ', format: ' + meta.format + ', size: ' + (fs.statSync(filePath).size / 1024).toFixed(1) + ' KB');
  }
}

inspect().catch(console.error);