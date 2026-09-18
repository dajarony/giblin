import * as THREE from 'three';
import { TramModel } from './TramModel';
import type { CameraMode, WeatherPreset } from '../types/game';
import { CameraController } from './world/CameraController';
import { SkyParcelSystem } from './world/SkyParcelSystem';
import { applyWeatherPreset as applyWeather } from './world/applyWeatherPreset';

export class WorldRenderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public tram: TramModel;

  // Track Curve Spline
  public trackCurve: THREE.CatmullRomCurve3;
  private trackGroup: THREE.Group;

  // Lighting & Environment
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private fog: THREE.FogExp2;
  private ocean!: THREE.Mesh;
  private oceanMat!: THREE.MeshStandardMaterial;
  private cloudGroup: THREE.Group;
  private starPoints!: THREE.Points;
  private lighthouseLight: THREE.SpotLight;
  private lighthouseBeamGroup: THREE.Group;

  // Wildlife & Ambient
  private seagulls: THREE.Group[] = [];
  private cloudWhale: THREE.Group;
  private readonly cameraController: CameraController;
  private readonly parcelSystem: SkyParcelSystem;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();

    // Setup initial fog & background
    this.fog = new THREE.FogExp2(0x282646, 0.0025);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0x282646);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 2500);
    this.camera.position.set(0, 30, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // ── 1. Lighting Setup ──
    this.hemiLight = new THREE.HemisphereLight(0xffdfba, 0x2b3358, 0.9);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffe2ab, 1.3);
    this.sunLight.position.set(140, 160, 90);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -160;
    this.sunLight.shadow.camera.right = 160;
    this.sunLight.shadow.camera.top = 160;
    this.sunLight.shadow.camera.bottom = -160;
    this.scene.add(this.sunLight);

    this.rimLight = new THREE.DirectionalLight(0xff9977, 0.55);
    this.rimLight.position.set(-120, 50, -110);
    this.scene.add(this.rimLight);

    // ── 2. Track Spline Definition ──
    // Closed continuous scenic loop through all 4 key stations
    const trackPoints = [
      new THREE.Vector3(-150, 24, -30),   // [u ≈ 0.05] Station 1: Saltlight Terminus
      new THREE.Vector3(-100, 38, -95),   // Pine Ridge Ascent
      new THREE.Vector3(-20, 58, -145),   // High Cloud Arch Bridge
      new THREE.Vector3(50, 48, -125),    // [u ≈ 0.32] Station 2: High Pines Sky Bridge
      new THREE.Vector3(120, 36, -75),    // East Coast Descent
      new THREE.Vector3(145, 22, 10),     // Coastal Shallows Turn
      new THREE.Vector3(140, 16, 65),     // [u ≈ 0.58] Station 3: Mango Tide Pier
      new THREE.Vector3(85, 12, 120),     // Low Sea-Spray Viaduct
      new THREE.Vector3(0, 16, 135),      // [u ≈ 0.84] Station 4: Oliver's Cloudworks
      new THREE.Vector3(-90, 20, 95),     // Sunset Bay Turn
      new THREE.Vector3(-145, 22, 35)     // Return to Saltlight Valley
    ];

    this.trackCurve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.22);
    this.trackGroup = new THREE.Group();
    this.buildTrackInfrastructure();
    this.scene.add(this.trackGroup);

    // ── 3. Islands, Stations & Scenery ──
    this.cloudGroup = new THREE.Group();
    this.cloudWhale = new THREE.Group();
    this.lighthouseBeamGroup = new THREE.Group();
    this.lighthouseLight = new THREE.SpotLight();

    this.buildWorldScenery();
    this.buildCloudSea();
    this.buildWildlife();
    this.parcelSystem = new SkyParcelSystem(this.scene, this.trackCurve);

    // ── 4. Tram Rig ──
    this.tram = new TramModel();
    this.scene.add(this.tram.group);

    // ── 5. Camera input lifecycle ──
    this.cameraController = new CameraController(this.camera, container);
  }

  private buildTrackInfrastructure() {
    const railMat = new THREE.MeshStandardMaterial({ color: 0x6e7888, metalness: 0.8, roughness: 0.25 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x482d1c, roughness: 0.85 });
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x362f44, roughness: 0.7, flatShading: true });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x1f1d24 });

    const numSamples = 260;
    const sleeperGeo = new THREE.BoxGeometry(3.8, 0.35, 1.1);
    const pylonGeo = new THREE.CylinderGeometry(0.9, 1.6, 1, 6);

    for (let i = 0; i < numSamples; i++) {
      const u = i / numSamples;
      const pt = this.trackCurve.getPointAt(u);
      const tangent = this.trackCurve.getTangentAt(u).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      // Wooden sleeper tie
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.copy(pt).addScaledVector(binormal, -0.2);

      const rotMat = new THREE.Matrix4().makeBasis(normal, binormal, tangent);
      sleeper.setRotationFromMatrix(rotMat);
      sleeper.castShadow = true;
      sleeper.receiveShadow = true;
      this.trackGroup.add(sleeper);

      // Support Pylons down to island base or deep cloud pillars
      if (i % 6 === 0) {
        const height = pt.y + 75;
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.set(pt.x, pt.y - height / 2 - 0.5, pt.z);
        pylon.scale.set(1, height, 1);
        pylon.castShadow = true;
        this.trackGroup.add(pylon);
      }
    }

    // Extrude Twin Steel Rail Tubes
    const buildRail = (offset: number) => {
      const pts: THREE.Vector3[] = [];
      const samples = 320;
      for (let i = 0; i <= samples; i++) {
        const u = (i / samples) % 1;
        const pt = this.trackCurve.getPointAt(u);
        const tangent = this.trackCurve.getTangentAt(u).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        pts.push(pt.clone().addScaledVector(normal, offset).add(new THREE.Vector3(0, 0.28, 0)));
      }
      const spline = new THREE.CatmullRomCurve3(pts, true);
      const tubeGeo = new THREE.TubeGeometry(spline, 320, 0.16, 6, true);
      const railMesh = new THREE.Mesh(tubeGeo, railMat);
      railMesh.castShadow = true;
      return railMesh;
    };

    this.trackGroup.add(buildRail(1.15));
    this.trackGroup.add(buildRail(-1.15));

    // Overhead catenary power wire
    const cablePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const u = (i / 200) % 1;
      const pt = this.trackCurve.getPointAt(u);
      cablePts.push(pt.clone().add(new THREE.Vector3(0, 3.8, 0)));
    }
    const cableSpline = new THREE.CatmullRomCurve3(cablePts, true);
    const cableTube = new THREE.TubeGeometry(cableSpline, 200, 0.05, 4, true);
    this.trackGroup.add(new THREE.Mesh(cableTube, cableMat));
  }

  private buildWorldScenery() {
    // ── 1. Shimmering Ocean Below ──
    const oceanGeo = new THREE.PlaneGeometry(3200, 3200, 48, 48);
    this.oceanMat = new THREE.MeshStandardMaterial({
      color: 0x1d4763,
      roughness: 0.15,
      metalness: 0.45,
      flatShading: true
    });
    this.ocean = new THREE.Mesh(oceanGeo, this.oceanMat);
    this.ocean.rotation.x = -Math.PI / 2;
    this.ocean.position.y = -85;
    this.ocean.receiveShadow = true;
    this.scene.add(this.ocean);

    // ── 2. Station 1: Saltlight Terminus Island ──
    this.createIsland(-150, 22, -30, 52, 75, 0x3d354b, 0x487445);
    this.createStationPlatform(-150, 24, -30, 0.25, 'Saltlight Terminus');
    this.createHouse(-166, 24, -38, 9, 7, 10, 0.35);
    this.createHouse(-158, 24, -60, 8, 6, 9, -0.2);
    this.createHouse(-175, 24, -18, 7, 8, 8, 0.8);
    this.createHouse(-140, 24, -70, 7, 5, 8, 0.1);
    this.createLighthouse(-178, 24, -48);
    this.createTree(-135, 24, -48, 'pine', 1.4);
    this.createTree(-142, 24, -16, 'pine', 1.1);
    this.createTree(-162, 24, -10, 'pine', 1.3);

    // ── 3. Station 2: High Pines Alpine Spire ──
    this.createIsland(50, 46, -125, 48, 110, 0x383542, 0x395e40);
    this.createStationPlatform(50, 48, -125, -0.4, 'High Pines Sky Bridge');
    this.createHouse(64, 48, -135, 8, 6, 8, 0.5);
    this.createHouse(58, 48, -105, 7, 7, 7, -0.3);
    for (let t = 0; t < 8; t++) {
      const angle = (t / 8) * Math.PI * 2;
      this.createTree(50 + Math.cos(angle) * 26, 48, -125 + Math.sin(angle) * 26, 'pine', 1.3 + Math.random() * 0.5);
    }

    // ── 4. Station 3: Mango Tide Pier Island ──
    this.createIsland(140, 14, 65, 46, 65, 0x473b32, 0x6e8a40);
    this.createStationPlatform(140, 16, 65, -2.3, 'Mango Tide Pier');
    this.createHouse(156, 16, 52, 10, 7, 9, -0.5);
    this.createHouse(148, 16, 82, 9, 8, 8, 0.4);
    this.createHouse(165, 16, 70, 7, 6, 10, -0.1);
    this.createTree(132, 16, 80, 'deciduous', 1.5);
    this.createTree(152, 16, 35, 'deciduous', 1.3);
    this.createTree(160, 16, 90, 'deciduous', 1.4);

    // ── 5. Station 4: Oliver's Cloudworks Hangar Island ──
    this.createIsland(0, 14, 135, 42, 60, 0x362c3b, 0x586940);
    this.createStationPlatform(0, 16, 135, 3.14, 'Oliver\'s Cloudworks Dock');
    this.createWorkshopHangar(0, 16, 145);
    this.createTree(-20, 16, 140, 'pine', 1.2);
    this.createTree(22, 16, 142, 'deciduous', 1.3);

    // ── 6. Extra Scenic Islands / Crags ──
    this.createIsland(-20, 52, -165, 30, 95, 0x3c3445, 0x486b42);
    this.createIsland(115, 30, -85, 26, 75, 0x423832, 0x5c7a3e);
    this.createIsland(-90, 16, 115, 28, 55, 0x352b3d, 0x4d633c);

    // Steam boat cruising below in the bay
    this.createSteamBoat(-80, -84, 0);
  }

  private createIsland(x: number, y: number, z: number, radius: number, height: number, rockColor: number, grassColor: number) {
    const island = new THREE.Group();
    island.position.set(x, y, z);

    // Deformed rocky cone
    const rockGeo = new THREE.ConeGeometry(radius, height, 9, 4);
    const pos = rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = Math.sin(vx * 0.18) * Math.cos(vz * 0.18) * 3.2;
      pos.setXYZ(i, vx + noise, vy, vz + noise);
    }
    rockGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({ color: rockColor, roughness: 0.9, flatShading: true });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.rotation.x = Math.PI;
    rock.position.y = -height / 2;
    rock.castShadow = true;
    rock.receiveShadow = true;
    island.add(rock);

    // Grass Top Cap
    const topGeo = new THREE.CylinderGeometry(radius * 0.94, radius * 0.82, 3.8, 9);
    const grassMat = new THREE.MeshStandardMaterial({ color: grassColor, roughness: 0.75, flatShading: true });
    const top = new THREE.Mesh(topGeo, grassMat);
    top.position.y = 0.5;
    top.receiveShadow = true;
    island.add(top);

    this.scene.add(island);
  }

  private createHouse(x: number, y: number, z: number, w = 7, h = 6, d = 8, rotY = 0) {
    const house = new THREE.Group();
    house.position.set(x, y, z);
    house.rotation.y = rotY;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5eedb, roughness: 0.7 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    walls.position.y = h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc4583b, roughness: 0.65, flatShading: true });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.85, 3.5, 4), roofMat);
    roof.position.y = h + 1.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Glowing cozy evening window
    const winMat = new THREE.MeshStandardMaterial({ color: 0xffdf88, emissive: 0xff9922, emissiveIntensity: 0.9 });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), winMat);
    win.position.set(0, h * 0.55, d / 2 + 0.05);
    house.add(win);

    this.scene.add(house);
  }

  private createTree(x: number, y: number, z: number, type: 'pine' | 'deciduous' = 'pine', scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 3.0, 5), trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({
      color: type === 'pine' ? 0x225841 : 0x5a873c,
      roughness: 0.7,
      flatShading: true
    });

    if (type === 'pine') {
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 - i * 0.6, 2.5, 6), foliageMat);
        cone.position.y = 2.8 + i * 1.5;
        cone.castShadow = true;
        tree.add(cone);
      }
    } else {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), foliageMat);
      puff.position.y = 3.6;
      puff.castShadow = true;
      tree.add(puff);
    }

    this.scene.add(tree);
  }

  private createStationPlatform(x: number, y: number, z: number, rotY: number, _name: string) {
    const plat = new THREE.Group();
    plat.position.set(x, y, z);
    plat.rotation.y = rotY;

    // Platform Deck
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x6e4b31, roughness: 0.8 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 26), deckMat);
    deck.position.set(4.0, 0.7, 0);
    deck.receiveShadow = true;
    plat.add(deck);

    // Canopy Posts & Roof
    const postMat = new THREE.MeshStandardMaterial({ color: 0x2a221b });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.5, 6), postMat);
    p1.position.set(6.2, 3.5, 10);
    plat.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.5, 6), postMat);
    p2.position.set(6.2, 3.5, -10);
    plat.add(p2);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e4738, roughness: 0.6 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7, 0.5, 24), roofMat);
    roof.position.set(5.0, 6.2, 0);
    roof.castShadow = true;
    plat.add(roof);

    // Platform Lanterns
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffaa22, emissive: 0xff8800, emissiveIntensity: 1.2 });
    const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), lanternMat);
    l1.position.set(5.0, 5.8, 8);
    plat.add(l1);
    const l2 = l1.clone();
    l2.position.set(5.0, 5.8, -8);
    plat.add(l2);

    // Townsfolk Waiting
    const folkColors = [0xc2593f, 0x3d7b88, 0xd4a340, 0x5a4872];
    for (let p = 0; p < 5; p++) {
      const folk = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: folkColors[p % folkColors.length] });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.5, 6), bodyMat);
      body.position.y = 1.9;
      folk.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffd9b3 }));
      head.position.y = 2.8;
      folk.add(head);

      folk.position.set(4.2 + (Math.random() - 0.5) * 1.6, 0, -8 + p * 4.0);
      plat.add(folk);
    }

    this.scene.add(plat);
  }

  private createLighthouse(x: number, y: number, z: number) {
    const lighthouse = new THREE.Group();
    lighthouse.position.set(x, y, z);

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 4.2, 26, 8),
      new THREE.MeshStandardMaterial({ color: 0xeee7dc, roughness: 0.6 })
    );
    tower.position.y = 13;
    tower.castShadow = true;
    lighthouse.add(tower);

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 4.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x9e382b, roughness: 0.5 })
    );
    top.position.y = 27;
    lighthouse.add(top);

    // Lighthouse Rotating Beam Light
    this.lighthouseBeamGroup.position.set(x, y + 27, z);
    this.lighthouseLight = new THREE.SpotLight(0xffeedd, 5.0, 240, Math.PI / 7, 0.3, 0.8);
    this.lighthouseLight.position.set(0, 0, 0);
    this.lighthouseLight.target.position.set(100, -10, 0);
    this.lighthouseBeamGroup.add(this.lighthouseLight);
    this.lighthouseBeamGroup.add(this.lighthouseLight.target);
    this.scene.add(this.lighthouseBeamGroup);

    this.scene.add(lighthouse);
  }

  private createWorkshopHangar(x: number, y: number, z: number) {
    const hangarMat = new THREE.MeshStandardMaterial({ color: 0x543928, roughness: 0.7 });
    const hangar = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 24), hangarMat);
    hangar.position.set(x, y + 6, z);
    hangar.castShadow = true;
    this.scene.add(hangar);

    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 24, 10, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x224a3a, roughness: 0.6 })
    );
    roof.position.set(x, y + 12, z);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.castShadow = true;
    this.scene.add(roof);

    // Warm Hangar Forge Glow
    const forgeGlow = new THREE.PointLight(0xff7722, 3.0, 30);
    forgeGlow.position.set(x, y + 6, z - 10);
    this.scene.add(forgeGlow);
  }

  private createSteamBoat(x: number, y: number, z: number) {
    const boat = new THREE.Group();
    boat.position.set(x, y, z);

    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(12, 4, 30),
      new THREE.MeshStandardMaterial({ color: 0xf0e6d6, roughness: 0.6 })
    );
    hull.position.y = 2;
    boat.add(hull);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 14),
      new THREE.MeshStandardMaterial({ color: 0x8c422c })
    );
    cabin.position.set(0, 5, -2);
    boat.add(cabin);

    const stack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a2830 })
    );
    stack.position.set(0, 9, -2);
    boat.add(stack);

    this.scene.add(boat);
  }

  private buildCloudSea() {
    const cloudGeo = new THREE.DodecahedronGeometry(18, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebf2,
      roughness: 0.9,
      flatShading: true,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 95; i++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 90 + Math.random() * 340;
      puff.position.set(
        Math.cos(angle) * radius,
        -36 + (Math.random() - 0.5) * 22,
        Math.sin(angle) * radius
      );
      const s = 0.8 + Math.random() * 1.8;
      puff.scale.set(s * 1.6, s * 0.75, s * 1.3);
      puff.rotation.set(Math.random(), Math.random(), Math.random());
      this.cloudGroup.add(puff);
    }
    this.scene.add(this.cloudGroup);

    // Star points
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1600;
      starPos[i + 1] = 120 + Math.random() * 500;
      starPos[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffeedd, size: 2.2, transparent: true, opacity: 0.8 });
    this.starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starPoints);
  }

  private buildWildlife() {
    // 1. Flock of Animated Seagulls
    const gullMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const gull = new THREE.Group();
      const wing1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), gullMat);
      wing1.position.x = 0.6;
      wing1.name = 'wing1';
      gull.add(wing1);

      const wing2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), gullMat);
      wing2.position.x = -0.6;
      wing2.name = 'wing2';
      gull.add(wing2);

      gull.position.set(-130 + (Math.random() - 0.5) * 60, 32 + Math.random() * 20, -40 + (Math.random() - 0.5) * 60);
      this.seagulls.push(gull);
      this.scene.add(gull);
    }

    // 2. Flying Gentle Cloud Whale in the distant horizon
    const whaleMat = new THREE.MeshStandardMaterial({ color: 0x426b7d, roughness: 0.8, flatShading: true });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xd8e4e8, roughness: 0.8, flatShading: true });

    const whaleBody = new THREE.Mesh(new THREE.ConeGeometry(8, 32, 8), whaleMat);
    whaleBody.rotation.x = Math.PI / 2;
    whaleBody.scale.set(1.4, 1.0, 0.8);
    this.cloudWhale.add(whaleBody);

    const belly = new THREE.Mesh(new THREE.ConeGeometry(7, 28, 8), bellyMat);
    belly.rotation.x = Math.PI / 2;
    belly.position.y = -1.2;
    this.cloudWhale.add(belly);

    // Whale Fin
    const finGeo = new THREE.BoxGeometry(16, 0.6, 6);
    const fins = new THREE.Mesh(finGeo, whaleMat);
    fins.position.set(0, 0, 4);
    this.cloudWhale.add(fins);

    this.cloudWhale.position.set(0, 110, -320);
    this.scene.add(this.cloudWhale);
  }

  public checkParcelPickups(trackPos: number): number {
    return this.parcelSystem.collectAt(trackPos);
  }

  public respawnParcels() {
    this.parcelSystem.respawn();
  }

  public applyWeatherPreset(preset: WeatherPreset) {
    applyWeather({
      scene: this.scene,
      fog: this.fog,
      hemisphereLight: this.hemiLight,
      sunLight: this.sunLight,
      rimLight: this.rimLight,
      oceanMaterial: this.oceanMat,
      stars: this.starPoints,
    }, preset);
  }

  public updateCamera(
    cameraMode: CameraMode,
    isWorkshopMode: boolean,
    tramPos: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuat: THREE.Quaternion,
    time: number,
  ) {
    this.cameraController.update(
      cameraMode,
      isWorkshopMode,
      tramPos,
      tramTangent,
      tramQuat,
      time,
    );
  }

  public update(dt: number, time: number) {
    // 1. Rotate clouds gently
    this.cloudGroup.rotation.y += 0.0006 * dt;

    // 2. Rotate Lighthouse Beam
    if (this.lighthouseBeamGroup) {
      this.lighthouseBeamGroup.rotation.y += 0.45 * dt;
    }

    // 3. Animate Seagulls
    this.seagulls.forEach((gull, idx) => {
      const wingFlap = Math.sin(time * 0.008 + idx);
      const w1 = gull.getObjectByName('wing1');
      const w2 = gull.getObjectByName('wing2');
      if (w1) w1.rotation.z = wingFlap * 0.5;
      if (w2) w2.rotation.z = -wingFlap * 0.5;

      gull.position.x += Math.sin(time * 0.001 + idx) * 0.3 * dt;
      gull.position.z += Math.cos(time * 0.001 + idx) * 0.3 * dt;
    });

    // 4. Animate Distant Cloud Whale
    if (this.cloudWhale) {
      const whaleAngle = time * 0.00008;
      this.cloudWhale.position.x = Math.sin(whaleAngle) * 360;
      this.cloudWhale.position.z = Math.cos(whaleAngle) * 360;
      this.cloudWhale.position.y = 95 + Math.sin(time * 0.0005) * 12;
      this.cloudWhale.rotation.y = whaleAngle + Math.PI / 2;
    }

    // 5. Animate collectible parcels
    this.parcelSystem.update(dt, time);

    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose() {
    this.cameraController.dispose();

    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else material?.dispose?.();
    });

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  public captureSnapshot(): string {
    return this.renderer.domElement.toDataURL('image/jpeg', 0.92);
  }
}
