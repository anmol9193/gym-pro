// Render the original demo models to local product photos with the vendored Three.js.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';
const allSlugs = JSON.parse(fs.readFileSync(path.join(root, 'assets/products.json'), 'utf8')).map(item => item.slug);
const slugs = process.argv.length > 2 ? process.argv.slice(2) : allSlugs;
if (slugs.some(slug => !allSlugs.includes(slug))) throw new Error('Unknown product slug.');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.goto(`${origin}/index.html`, { waitUntil: 'load' });
  await page.addScriptTag({ path: path.join(__dirname, 'product-models.js') });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(1000, 1000); renderer.setPixelRatio(1);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(); scene.background = new T.Color(0xeff0e9);
    scene.add(new T.HemisphereLight(0xffffff, 0x899078, 2.3));
    const key = new T.DirectionalLight(0xffffff, 3.2); key.position.set(-3, 7, 5); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.bias = -.0003; key.shadow.normalBias = .015;
    scene.add(key);
    const fill = new T.DirectionalLight(0xf2ffe0, 1.1); fill.position.set(4, 3, -4); scene.add(fill);
    const plane = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshStandardMaterial({ color: 0xeff0e9, roughness: 1 })); plane.rotation.x = -Math.PI / 2; plane.receiveShadow = true; scene.add(plane);
    const camera = new T.PerspectiveCamera(34, 1, .1, 500);
    window.renderProductView = (slug, view) => {
      const model = window.createDemoProduct(slug, T); scene.add(model);
      const box = new T.Box3().setFromObject(model); plane.position.y = box.min.y - .025;
      const positions = [[4.8, 3.4, 6.8],[-5.3, 3.1, 6.5],[5.9, 4.8, 4.8]];
      camera.position.set(...positions[view]); camera.lookAt(0, -.02, 0);
      renderer.render(scene, camera);
      const image = renderer.domElement.toDataURL('image/jpeg', .92).split(',')[1];
      scene.remove(model);
      const geometries = new Set(), materials = new Set();
      model.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => { material.map?.dispose(); material.dispose(); });
      return image;
    };
  });
  const target = path.join(root, 'assets/products'); fs.mkdirSync(target, { recursive: true });
  for (const slug of slugs) {
    for (let view = 0; view < 3; view++) {
      const encoded = await page.evaluate(({ slug, view }) => window.renderProductView(slug, view), { slug, view });
      fs.writeFileSync(path.join(target, `${slug}-${view + 1}.jpg`), Buffer.from(encoded, 'base64'));
    }
    console.log(`Rendered ${slug}: 3 views.`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
