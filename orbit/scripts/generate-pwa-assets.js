/**
 * PWA Assets Generator
 *
 * This script generates PWA icons and splash screens as PNG files using sharp.
 * Run with: node scripts/generate-pwa-assets.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Brand colors
const ORBIT_BLUE = '#3B82F6';
const STELLAR_VIOLET = '#8B5CF6';
const COSMIC_MIDNIGHT = '#0A0E1A';

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_TOUCH_ICON_SIZE = 180;
const MASKABLE_ICON_SIZE = 512;

// iOS Splash screen sizes
const SPLASH_SIZES = [
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
  { width: 828, height: 1792, name: 'apple-splash-828-1792' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' },
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' },
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556' },
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
  { width: 1668, height: 2224, name: 'apple-splash-1668-2224' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
];

// Generate SVG icon
function generateIconSVG(size, maskable = false) {
  const padding = maskable ? size * 0.1 : 0;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerSize = size - (padding * 2);
  const radius = innerSize / 2;
  const letterSize = innerSize * 0.5;
  const cornerRadius = maskable ? 0 : size * 0.18;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${ORBIT_BLUE}"/>
      <stop offset="100%" style="stop-color:${STELLAR_VIOLET}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  ${maskable
    ? `<rect width="${size}" height="${size}" fill="${COSMIC_MIDNIGHT}"/>
       <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.85}" fill="url(#bgGradient)"/>`
    : `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bgGradient)"/>`}

  <!-- Letter O -->
  <text
    x="${centerX}"
    y="${centerY + letterSize * 0.08}"
    font-family="Arial, sans-serif"
    font-size="${letterSize}"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >O</text>

  <!-- Orbit ring -->
  <ellipse
    cx="${centerX}"
    cy="${centerY}"
    rx="${radius * 0.68}"
    ry="${radius * 0.24}"
    fill="none"
    stroke="rgba(255,255,255,0.35)"
    stroke-width="${Math.max(size * 0.025, 2)}"
    transform="rotate(-20 ${centerX} ${centerY})"
  />
</svg>`;
}

// Generate splash screen SVG
function generateSplashSVG(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const logoSize = Math.min(width, height) * 0.2;

  // Generate random stars
  const stars = Array.from({ length: 30 }, () => {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const r = (Math.random() * 2 + 0.5).toFixed(1);
    const opacity = (Math.random() * 0.4 + 0.1).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,${opacity})"/>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COSMIC_MIDNIGHT}"/>
      <stop offset="100%" style="stop-color:#151a2e"/>
    </linearGradient>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${ORBIT_BLUE}"/>
      <stop offset="100%" style="stop-color:${STELLAR_VIOLET}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

  <!-- Stars -->
  ${stars}

  <!-- Logo circle -->
  <circle cx="${centerX}" cy="${centerY - logoSize * 0.3}" r="${logoSize * 0.5}" fill="url(#logoGrad)"/>

  <!-- Letter O -->
  <text
    x="${centerX}"
    y="${centerY - logoSize * 0.22}"
    font-family="Arial, sans-serif"
    font-size="${logoSize * 0.5}"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >O</text>

  <!-- Orbit ring -->
  <ellipse
    cx="${centerX}"
    cy="${centerY - logoSize * 0.3}"
    rx="${logoSize * 0.34}"
    ry="${logoSize * 0.12}"
    fill="none"
    stroke="rgba(255,255,255,0.35)"
    stroke-width="${Math.max(logoSize * 0.025, 3)}"
    transform="rotate(-20 ${centerX} ${centerY - logoSize * 0.3})"
  />

  <!-- App name -->
  <text
    x="${centerX}"
    y="${centerY + logoSize * 0.5}"
    font-family="Arial, sans-serif"
    font-size="${logoSize * 0.28}"
    font-weight="600"
    fill="white"
    text-anchor="middle"
  >Orbit</text>

  <!-- Tagline -->
  <text
    x="${centerX}"
    y="${centerY + logoSize * 0.75}"
    font-family="Arial, sans-serif"
    font-size="${logoSize * 0.11}"
    fill="rgba(255,255,255,0.6)"
    text-anchor="middle"
  >Connect. Communicate. Orbit.</text>
</svg>`;
}

async function generateAssets() {
  // Ensure directories exist
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const splashDir = path.join(__dirname, '..', 'public', 'splash');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  console.log('Generating PWA icons...');

  // Generate regular icons
  for (const size of ICON_SIZES) {
    const svg = generateIconSVG(size, false);
    const filename = `icon-${size}x${size}.png`;
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, filename));
    console.log(`  Created: ${filename}`);
  }

  // Apple touch icon
  const appleTouchSvg = generateIconSVG(APPLE_TOUCH_ICON_SIZE, false);
  await sharp(Buffer.from(appleTouchSvg))
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('  Created: apple-touch-icon.png');

  // Maskable icon
  const maskableSvg = generateIconSVG(MASKABLE_ICON_SIZE, true);
  await sharp(Buffer.from(maskableSvg))
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'));
  console.log('  Created: maskable-icon-512x512.png');

  console.log('\nGenerating iOS splash screens...');

  for (const { width, height, name } of SPLASH_SIZES) {
    const svg = generateSplashSVG(width, height);
    const filename = `${name}.png`;
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(splashDir, filename));
    console.log(`  Created: ${filename}`);
  }

  console.log('\n✅ PWA assets generated successfully!');
}

generateAssets().catch(console.error);
