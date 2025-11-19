const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const svgPath = path.resolve(__dirname, '..', 'logo', 'logo.svg');
    const assetsDir = path.resolve(__dirname, '..', 'assets');

    if (!fs.existsSync(svgPath)) throw new Error('File logo/logo.svg not found');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

    const svgBuffer = fs.readFileSync(svgPath);

    // 1) Adaptive foreground (transparent) 1024x1024
    const fgBuffer = await sharp(svgBuffer)
      .resize(768, 768, { fit: 'contain' })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: fgBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    // 2) App icon with background (#1e3a8a) 1024x1024
    const bgColor = '#1e3a8a';
    const fgForIcon = await sharp(svgBuffer).resize(700, 700, { fit: 'contain' }).png().toBuffer();

    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: bgColor } })
      .composite([{ input: fgForIcon, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'icon.png'));

    // 3) Splash icon 2048x2048 (centered)
    const splashFg = await sharp(svgBuffer).resize(1200, 1200, { fit: 'contain' }).png().toBuffer();

    await sharp({ create: { width: 2048, height: 2048, channels: 4, background: bgColor } })
      .composite([{ input: splashFg, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'splash-icon.png'));

    // 4) Play Store icon (512x512)
    const playStoreFg = await sharp(svgBuffer).resize(360, 360, { fit: 'contain' }).png().toBuffer();
    await sharp({ create: { width: 512, height: 512, channels: 4, background: bgColor } })
      .composite([{ input: playStoreFg, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'icon-playstore-512.png'));

    // 5) iOS icon (180x180) for home / App Store thumbnails
    const iosFg = await sharp(svgBuffer).resize(120, 120, { fit: 'contain' }).png().toBuffer();
    await sharp({ create: { width: 180, height: 180, channels: 4, background: bgColor } })
      .composite([{ input: iosFg, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'icon-ios-180.png'));

    console.log('Generated assets: assets/adaptive-icon.png, assets/icon.png, assets/splash-icon.png');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
