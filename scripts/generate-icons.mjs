import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// SVG content for the icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Arial, Helvetica, sans-serif" font-size="300" font-weight="700" fill="white" text-anchor="middle">D</text>
</svg>`;

// Icon sizes needed for manifest.json and various purposes
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);

  console.log('Generating icons...');

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: icons/icon-${size}x${size}.png`);
  }

  // Create favicon-16x16.png
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(join(publicDir, 'favicon-16x16.png'));
  console.log('  Created: favicon-16x16.png');

  // Create favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'));
  console.log('  Created: favicon-32x32.png');

  // Create apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('  Created: apple-touch-icon.png');

  // Create OG image (1200x630)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="ogbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#111827"/>
        <stop offset="100%" style="stop-color:#1f2937"/>
      </linearGradient>
      <linearGradient id="textgrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#60a5fa"/>
        <stop offset="100%" style="stop-color:#3b82f6"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogbg)"/>
    <text x="600" y="280" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="700" fill="white" text-anchor="middle">dars</text>
    <text x="600" y="280" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="700" fill="url(#textgrad)" text-anchor="middle" dx="200">linker</text>
    <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#9ca3af" text-anchor="middle">O'zbekiston EdTech Platformasi</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  console.log('  Created: og-image.png');

  console.log('Done!');
}

generateIcons().catch(console.error);
