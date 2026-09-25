// This script generates PWA icons
// You'll need to install sharp: npm install sharp

const sharp = require('sharp');

// Create a simple icon (you can replace this with your actual icon)
const createIcon = async (size, filename) => {
  // Create a simple blue square with rounded corners
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#0071e3" rx="${size * 0.2}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="white" font-weight="bold">H</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/${filename}`);
  
  console.log(`Created ${filename}`);
};

const generateIcons = async () => {
  // Android/Chrome
  await createIcon(72, 'icon-72x72.png');
  await createIcon(96, 'icon-96x96.png');
  await createIcon(128, 'icon-128x128.png');
  await createIcon(144, 'icon-144x144.png');
  await createIcon(152, 'icon-152x152.png');
  await createIcon(192, 'pwa-192x192.png');
  await createIcon(384, 'icon-384x384.png');
  await createIcon(512, 'pwa-512x512.png');
  
  // iOS
  await createIcon(180, 'apple-touch-icon.png');
  
  console.log('All icons generated successfully!');
};

generateIcons().catch(console.error);