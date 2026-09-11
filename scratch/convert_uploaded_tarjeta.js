const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/fcontreras/.gemini/antigravity/brain/5a57b46d-0fb1-4213-abbb-edabab29d30c/.user_uploaded/media_1789144872529.jpg';
const targetDir = path.join(__dirname, '../public/products/tarjeta-nfc');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetWebpName = 'tarjeta-nfc-bolsillo-resenas-google-panama.webp';
const targetWebpPath = path.join(targetDir, targetWebpName);

const targetPrincipalName = 'tarjeta-nfc-bolsillo-principal.webp';
const targetPrincipalPath = path.join(targetDir, targetPrincipalName);

async function convertImage() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Original image metadata:', metadata.width, 'x', metadata.height, metadata.format);

  // Convert to WebP optimized for web performance and SEO
  await sharp(inputPath)
    .resize(1000, 1000, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .webp({ quality: 85, effort: 6 })
    .toFile(targetWebpPath);

  await sharp(inputPath)
    .resize(1000, 1000, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .webp({ quality: 85, effort: 6 })
    .toFile(targetPrincipalPath);

  const stats = fs.statSync(targetWebpPath);
  console.log('Converted WebP saved successfully:', targetWebpPath, 'Size:', stats.size, 'bytes');
}

convertImage().catch(console.error);
