const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.resolve(__dirname, '../reseñas');
const outputDir = path.resolve(__dirname, '../public/images/resenas-google');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const map = [
  {
    input: 'restaurantes.jpeg',
    output: 'resenas-google-restaurantes-panama-startap.webp',
    title: 'Restaurantes',
    quality: 76
  },
  {
    input: 'clínicas y consultorios.jpeg',
    output: 'resenas-google-clinicas-consultorios-panama-startap.webp',
    title: 'Clínicas y Consultorios',
    quality: 82
  },
  {
    input: 'Barberia.png',
    output: 'resenas-google-barberias-salones-panama-startap.webp',
    title: 'Barberías y Salones',
    quality: 82
  },
  {
    input: 'Talle.png',
    output: 'resenas-google-talleres-mecanicas-panama-startap.webp',
    title: 'Talleres y Mecánicas',
    quality: 82
  },
  {
    input: 'hoteles y hospedajes.jpeg',
    output: 'resenas-google-hoteles-hospedajes-panama-startap.webp',
    title: 'Hoteles y Hospedajes',
    quality: 80
  },
  {
    input: 'tiendas y comercios.png',
    output: 'resenas-google-tiendas-comercios-panama-startap.webp',
    title: 'Tiendas y Comercios',
    quality: 82
  }
];

async function convertAll() {
  for (const item of map) {
    const src = path.join(inputDir, item.input);
    const dest = path.join(outputDir, item.output);
    await sharp(src)
      .webp({ quality: item.quality, effort: 6 })
      .toFile(dest);

    const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(item.title + ': ' + newSize + ' KB -> ' + item.output);
  }
}

convertAll().catch(console.error);