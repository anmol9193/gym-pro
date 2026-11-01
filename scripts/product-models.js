/* Original procedural models for the explicitly labelled demo collection. */
window.createDemoProduct = function (slug, T) {
  const group = new T.Group();
  const black = new T.MeshStandardMaterial({ color: 0x20251e, roughness: .65, metalness: .15 });
  const dark = new T.MeshStandardMaterial({ color: 0x10150e, roughness: .8 });
  const lime = new T.MeshStandardMaterial({ color: 0xcdf34b, roughness: .4, metalness: .15 });
  const silver = new T.MeshStandardMaterial({ color: 0xbec4ba, roughness: .23, metalness: .8 });
  const grey = new T.MeshStandardMaterial({ color: 0x9da98c, roughness: .6 });
  function mesh(geometry, material, position = [0, 0, 0]) {
    const object = new T.Mesh(geometry, material);
    object.position.set(...position); object.castShadow = true; object.receiveShadow = true;
    group.add(object); return object;
  }
  function cylinder(radius, height, position, material, sides = 64) {
    return mesh(new T.CylinderGeometry(radius, radius, height, sides), material, position);
  }
  function ring(radius, thickness, position, material) {
    return mesh(new T.TorusGeometry(radius, thickness, 12, 80), material, position);
  }
  function label(text, width, height, position, color = '#d2fa49', background = '#20251e') {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const context = canvas.getContext('2d'); context.fillStyle = background; context.fillRect(0, 0, 1024, 256);
    context.fillStyle = color; context.font = '800 140px Poppins, sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 512, 138);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
    const material = new T.MeshStandardMaterial({ map: texture, roughness: .75 });
    return mesh(new T.PlaneGeometry(width, height), material, position);
  }
  function curvedLabel(text, radius, arc, height, y, color = '#d2fa49') {
    const mark = label(text, 1, height, [0, y, 0], color);
    mark.geometry.dispose();
    mark.geometry = new T.CylinderGeometry(radius, radius, height, 48, 1, true, -arc / 2, arc);
    mark.castShadow = false;
    return mark;
  }
  const supplements = {
    'whey-protein': { lines: ['WHEY', 'PROTEIN'], colour: '#d2fa49', kind: 'PROTEIN COLLECTION', radius: .88, height: 1.95 },
    'whey-isolate': { lines: ['WHEY', 'ISOLATE'], colour: '#86bfff', kind: 'PROTEIN COLLECTION', radius: .85, height: 1.95, pale: true },
    'plant-protein': { lines: ['PLANT', 'PROTEIN'], colour: '#92b882', kind: 'PROTEIN COLLECTION', radius: .83, height: 1.95, pale: true },
    'creatine-monohydrate': { lines: ['CREATINE'], colour: '#bb9af8', kind: 'MONOHYDRATE / CONCEPT', radius: .78, height: 1.35 },
    'pre-workout': { lines: ['PRE', 'WORKOUT'], colour: '#ffae67', kind: 'PRE-WORKOUT COLLECTION', radius: .78, height: 1.5 },
    'mass-gainer': { lines: ['MASS', 'GAINER'], colour: '#fa8692', kind: 'GAINER COLLECTION', radius: 1.0, height: 2.25 },
    'daily-multivitamin': { lines: ['DAILY', 'MULTI'], colour: '#f4c66c', kind: 'MULTIVITAMIN / CONCEPT', radius: .56, height: 1.7, bottle: true },
    'omega-3': { lines: ['OMEGA', '3'], colour: '#77d7c8', kind: 'OMEGA-3 / CONCEPT', radius: .56, height: 1.7, bottle: true }
  };
  if (supplements[slug]) {
    const config = supplements[slug], r = config.radius, h = config.height;
    const packaging = config.pale ? new T.MeshStandardMaterial({color:0xe5e4da,roughness:.42}) : black;
    const accent = new T.MeshStandardMaterial({color:config.colour,roughness:.45});
    const points = [[0,-h/2],[r*.88,-h/2],[r,-h/2+.1],[r,h/2-.15],[r*.9,h/2],[config.bottle?r*.72:r*.93,h/2+.1],[0,h/2+.1]].map(([x,y])=>new T.Vector2(x,y));
    mesh(new T.LatheGeometry(points,96),packaging);
    const lidRadius = config.bottle ? r*.77 : r*1.025;
    cylinder(lidRadius,.21,[0,h/2+.15,0],dark);
    cylinder(lidRadius*1.007,.025,[0,h/2+.06,0],accent);
    for(let i=0;i<64;i++){
      const angle=i*Math.PI*2/64;
      const rib=mesh(new T.BoxGeometry(.014,.16,.019),black,[Math.sin(angle)*lidRadius,h/2+.15,Math.cos(angle)*lidRadius]);
      rib.rotation.y=angle;
    }
    const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=config.pale?'#e8e7dd':'#1b211c';ctx.fillRect(0,0,1536,1024);
    ctx.fillStyle=config.colour;ctx.fillRect(0,0,1536,82);ctx.fillRect(0,918,1536,106);
    ctx.textAlign='center';ctx.textBaseline='middle';
    const ink=config.pale?'#18251b':'#f5f5e9';ctx.fillStyle=ink;
    ctx.font='800 53px Poppins';ctx.fillText('BEAST MODE',768,190);
    ctx.fillStyle=config.pale?'#44603d':config.colour;ctx.fillRect(475,268,586,7);
    const lineSize=config.lines.length===1?104:132;
    ctx.font=`800 ${lineSize}px Poppins`;ctx.fillStyle=ink;
    config.lines.forEach((line,i)=>ctx.fillText(line,768,config.lines.length===1?460:408+i*150,720));
    ctx.font='600 27px Poppins';ctx.fillStyle=config.pale?'#476344':config.colour;ctx.fillText(config.kind,768,685,740);
    ctx.font='500 25px Poppins';ctx.fillStyle=ink;ctx.fillText('DEMO PACKAGING',768,790);ctx.fillText('CONCEPT COLLECTION',768,835);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshStandardMaterial({map:texture,roughness:.56});
    const wrap=mesh(new T.CylinderGeometry(r+.009,r+.009,h*.77,96,1,true,-Math.PI*.82,Math.PI*1.64),material,[0,-.025,0]);
    wrap.castShadow=false;
    group.rotation.y=.32;
  } else if (slug === 'hex-dumbbell') {
    const handle = cylinder(.15, 2.1, [0, 0, 0], silver); handle.rotation.z = Math.PI / 2;
    for (let i = -9; i <= 9; i++) { const grip = cylinder(.158, .013, [i * .055, 0, 0], black, 32); grip.rotation.z = Math.PI / 2; }
    for (const side of [-1, 1]) {
      const plate = cylinder(.73, .62, [side * 1.16, 0, 0], black, 6); plate.rotation.z = Math.PI / 2;
      const trim = cylinder(.69, .055, [side * 1.49, 0, 0], lime, 6); trim.rotation.z = Math.PI / 2;
      const face = cylinder(.44, .06, [side * 1.53, 0, 0], dark, 6); face.rotation.z = Math.PI / 2;
      const cap = cylinder(.105, .065, [side * 1.57, 0, 0], silver, 32); cap.rotation.z = Math.PI / 2;
    }
    group.rotation.y = -.15;
  } else if (slug === 'training-kettlebell') {
    const points = [[0,-.9],[.45,-.9],[.76,-.75],[.92,-.35],[.95,.1],[.8,.54],[.5,.78],[.28,.85],[0,.85]].map(([x,y]) => new T.Vector2(x,y));
    mesh(new T.LatheGeometry(points, 80), black);
    const handle = ring(.66, .14, [0, 1.08, 0], dark); handle.scale.y = 1.05;
    const band = ring(.66, .145, [0, 1.08, 0], lime);
    band.geometry.dispose(); band.geometry = new T.TorusGeometry(.66, .145, 12, 24, .55); band.rotation.z = 1.3;
    curvedLabel('BEAST', .964, .88, .205, -.05);
    const badge = ring(.22, .018, [0, -.42, .91], lime); badge.scale.y = .7;
  } else if (slug === 'loop-resistance-bands') {
    const shades = [lime, grey, black];
    shades.forEach((material, index) => {
      const loop = mesh(new T.TorusGeometry(.78, .065, 8, 100), material, [(index - 1) * .57, -.2 + index * .07, (index - 1) * .4]);
      loop.rotation.x = Math.PI / 2; loop.rotation.z = -.25 + index * .2; loop.scale.set(.82, 1.6, .8);
      const strip = mesh(new T.BoxGeometry(.29, .04, .42), dark, [(index - 1) * .57 + .56, -.12 + index * .07, (index - 1) * .4]);
      strip.rotation.y = -.25 + index * .2;
    });
  } else if (slug === 'studio-yoga-mat') {
    mesh(new T.BoxGeometry(2.25, .065, 3.5), black, [0, -.5, .05]);
    mesh(new T.BoxGeometry(2.28, .025, 3.52), lime, [0, -.55, .05]);
    const roll = cylinder(.25, 2.27, [0, -.25, -1.55], black); roll.rotation.z = Math.PI / 2;
    for (const side of [-1, 1]) {
      for (const radius of [.07, .13, .19, .24]) {
        const edge = ring(radius, .008, [side * 1.14, -.25, -1.55], lime); edge.rotation.y = Math.PI / 2;
      }
    }
    for (let z = -1.2; z < 1.7; z += .16) mesh(new T.BoxGeometry(2.15, .003, .007), grey, [0, -.466, z]);
    const mark = label('BEAST MODE', .9, .225, [0, -.46, 1.18], '#ccd7be'); mark.rotation.x = -Math.PI / 2;
    group.rotation.y = -.2;
  } else if (slug === 'everyday-shaker') {
    const points = [[0,-1.15],[.42,-1.15],[.5,-1.08],[.55,.85],[.55,1],[0,1]].map(([x,y]) => new T.Vector2(x,y));
    mesh(new T.LatheGeometry(points, 80), black);
    cylinder(.57, .2, [0, 1, 0], lime);
    cylinder(.5, .1, [0, 1.15, 0], dark);
    const spout = cylinder(.16, .22, [0, 1.3, .22], dark); spout.rotation.x = .15;
    mesh(new T.BoxGeometry(.28, .08, .37), lime, [0, 1.45, .13]);
    const loop = ring(.23, .055, [0, 1.23, -.39], dark); loop.rotation.y = Math.PI / 2;
    curvedLabel('BEAST', .543, 1.65, .2, .15);
    curvedLabel('MODE', .538, 1.55, .18, -.08, '#eef1e5');
  } else if (slug === 'training-duffel') {
    const body = mesh(new T.CapsuleGeometry(.64, 1.8, 12, 40), black, [0, -.17, 0]); body.rotation.z = Math.PI / 2; body.scale.z = 1.1;
    for (const side of [-1, 1]) {
      const seam = ring(.59, .018, [side * 1.1, -.17, 0], grey); seam.rotation.y = Math.PI / 2; seam.scale.x = 1.08;
    }
    for (const z of [-.32, .32]) {
      const curve = new T.CatmullRomCurve3([new T.Vector3(-.7,.25,z),new T.Vector3(-.56,1.05,z),new T.Vector3(0,1.32,z),new T.Vector3(.56,1.05,z),new T.Vector3(.7,.25,z)]);
      mesh(new T.TubeGeometry(curve, 40, .055, 8, false), dark);
      for (const x of [-.7,.7]) mesh(new T.BoxGeometry(.1, .74, .025), dark, [x, -.06, z * 2.04]);
    }
    const zip = new T.CatmullRomCurve3([new T.Vector3(-1.1,.35,.15),new T.Vector3(0,.49,.15),new T.Vector3(1.1,.35,.15)]);
    mesh(new T.TubeGeometry(zip, 32, .013, 6, false), lime);
    mesh(new T.BoxGeometry(.1, .05, .11), silver, [.9, .39, .15]);
    label('BEAST MODE', 1.4, .35, [0, -.13, .71]);
    group.rotation.y = -.1;
  } else throw new Error('Unknown demo product: ' + slug);
  group.updateMatrixWorld(true);
  const box = new T.Box3().setFromObject(group);
  const center = box.getCenter(new T.Vector3());
  const size = box.getSize(new T.Vector3());
  const scale = 3.4 / Math.max(size.x, size.y, size.z);
  group.position.sub(center);
  const wrapper = new T.Group(); wrapper.add(group); wrapper.scale.setScalar(scale);
  return wrapper;
};
