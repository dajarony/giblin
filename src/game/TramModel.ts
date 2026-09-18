import * as THREE from 'three';
import { PAINT_SCHEMES } from './constants';

export class TramModel {
  public group: THREE.Group;
  public cabinGroup: THREE.Group;
  public bogieGroup: THREE.Group;
  
  // Dynamic Upgrades
  public vinesSlot: THREE.Group;
  public lanternsSlot: THREE.Group;
  public luggageSlot: THREE.Group;
  public suspensionSlot: THREE.Group;
  public whistleSlot: THREE.Group;
  public teacartSlot: THREE.Group;
  public gramophoneSlot: THREE.Group;

  // Materials for live paint switching
  private bodyMat: THREE.MeshStandardMaterial;
  private trimMat: THREE.MeshStandardMaterial;
  private roofMat: THREE.MeshStandardMaterial;
  private chassisMat: THREE.MeshStandardMaterial;

  // Wheels for rotation
  private wheels: THREE.Mesh[] = [];
  
  // Headlamp and interior lights
  private headlampLight: THREE.SpotLight;
  private headlampGlow: THREE.Mesh;
  private interiorLight: THREE.PointLight;
  private lanternLights: THREE.PointLight[] = [];

  // Steam particle mesh for whistle
  private steamParticles: THREE.Points;
  private steamGeo: THREE.BufferGeometry;
  private steamActive: boolean = false;
  private steamTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.cabinGroup = new THREE.Group();
    this.bogieGroup = new THREE.Group();

    // Base Materials
    const defaultPaint = PAINT_SCHEMES[0];
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: defaultPaint.primaryColor,
      roughness: 0.45,
      metalness: 0.2
    });
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: defaultPaint.secondaryColor,
      roughness: 0.75,
      metalness: 0.1
    });
    this.roofMat = new THREE.MeshStandardMaterial({
      color: defaultPaint.roofColor,
      roughness: 0.55
    });
    this.trimMat = new THREE.MeshStandardMaterial({
      color: defaultPaint.trimColor,
      metalness: 0.8,
      roughness: 0.3
    });

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x2b2830, metalness: 0.85, roughness: 0.25 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x3d3a45, metalness: 0.9, roughness: 0.2 });

    // ── 1. Bogie Hanger Assembly (Overhead rail runner) ──
    const hangerArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.6, 0.7), ironMat);
    hangerArm.position.y = 1.3;
    hangerArm.castShadow = true;
    this.bogieGroup.add(hangerArm);

    // Cross beam for dual rail bogies
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 1.8), ironMat);
    crossBeam.position.y = 2.4;
    crossBeam.castShadow = true;
    this.bogieGroup.add(crossBeam);

    // 4 Flanged Steel Bogie Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12);
    const wheelPositions = [
      [1.1, 2.4, 0.7],
      [-1.1, 2.4, 0.7],
      [1.1, 2.4, -0.7],
      [-1.1, 2.4, -0.7]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      this.bogieGroup.add(wheel);
      this.wheels.push(wheel);
    });

    this.group.add(this.bogieGroup);

    // ── 2. Cabin Structure (Suspended below rail) ──
    this.cabinGroup.position.y = -2.3;

    // Floor Chassis
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 7.8), this.chassisMat);
    floor.castShadow = true;
    floor.receiveShadow = true;
    this.cabinGroup.add(floor);

    // Brass side bumpers
    const bumperMat = this.trimMat;
    const bumper1 = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.15, 7.9), bumperMat);
    bumper1.position.y = 0.2;
    this.cabinGroup.add(bumper1);

    // Main Body Lower Shell
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 7.6), this.bodyMat);
    lowerBody.position.y = 1.15;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.cabinGroup.add(lowerBody);

    // Warm Panoramic Glass Windows
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xfffae8,
      emissive: 0xffb74d,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.78,
      roughness: 0.1
    });
    const glassUpper = new THREE.Mesh(new THREE.BoxGeometry(3.35, 1.25, 7.2), glassMat);
    glassUpper.position.y = 2.45;
    this.cabinGroup.add(glassUpper);

    // Window Pillars (Vintage mullions)
    const pillarGeo = new THREE.BoxGeometry(0.18, 1.3, 0.18);
    for (let pz = -3.2; pz <= 3.2; pz += 1.6) {
      const pLeft = new THREE.Mesh(pillarGeo, this.bodyMat);
      pLeft.position.set(1.7, 2.45, pz);
      this.cabinGroup.add(pLeft);

      const pRight = new THREE.Mesh(pillarGeo, this.bodyMat);
      pRight.position.set(-1.7, 2.45, pz);
      this.cabinGroup.add(pRight);
    }

    // Curved Wooden Clerestory Roof
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.85, 7.7, 16, 1, false, 0, Math.PI),
      this.roofMat
    );
    roof.position.y = 3.05;
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.castShadow = true;
    this.cabinGroup.add(roof);

    // Brass Roof Trim Ribs
    const ribGeo = new THREE.TorusGeometry(1.86, 0.05, 6, 16, Math.PI);
    for (let rz = -3.0; rz <= 3.0; rz += 1.5) {
      const rib = new THREE.Mesh(ribGeo, this.trimMat);
      rib.position.set(0, 3.05, rz);
      rib.rotation.y = Math.PI / 2;
      this.cabinGroup.add(rib);
    }

    // Interior Warm Light & Passenger Silhouettes
    this.interiorLight = new THREE.PointLight(0xffbe6b, 2.0, 16);
    this.interiorLight.position.set(0, 2.2, 0);
    this.cabinGroup.add(this.interiorLight);

    // Interior cozy passenger silhouettes
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x5a2d1d });
    const folkMat = new THREE.MeshStandardMaterial({ color: 0x221a28 });
    for (let s = -2.2; s <= 2.2; s += 1.4) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.8), seatMat);
      seat.position.set(1.0, 0.8, s);
      this.cabinGroup.add(seat);

      const passenger = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), folkMat);
      passenger.position.set(1.0, 1.6, s);
      this.cabinGroup.add(passenger);
    }

    // Front Headlamp with dynamic glow & volumetric cone
    const lampHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.6, 10),
      this.trimMat
    );
    lampHousing.position.set(0, 1.5, 4.0);
    lampHousing.rotation.x = Math.PI / 2;
    this.cabinGroup.add(lampHousing);

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffeedd,
      emissiveIntensity: 1.5
    });
    this.headlampGlow = new THREE.Mesh(new THREE.CircleGeometry(0.38, 12), glowMat);
    this.headlampGlow.position.set(0, 1.5, 4.31);
    this.cabinGroup.add(this.headlampGlow);

    this.headlampLight = new THREE.SpotLight(0xfff1d6, 4.5, 75, Math.PI / 5, 0.4, 1.2);
    this.headlampLight.position.set(0, 1.5, 4.3);
    this.headlampLight.target.position.set(0, 0, 30);
    this.cabinGroup.add(this.headlampLight);
    this.cabinGroup.add(this.headlampLight.target);

    // ── 3. Upgrade Visual Attachments ──
    // Upgrade 1: Hanging Ivy & Sun Awning
    this.vinesSlot = new THREE.Group();
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x2d6849,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 7.6), awningMat);
    awning.position.set(0, 3.4, 0);
    this.vinesSlot.add(awning);

    // Ivy foliage clusters along awning fringe
    const ivyMat = new THREE.MeshStandardMaterial({ color: 0x1e4f2b, roughness: 0.9, flatShading: true });
    for (let v = 0; v < 12; v++) {
      const clump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), ivyMat);
      clump.position.set(
        v % 2 === 0 ? 2.05 : -2.05,
        3.15 - (v % 3) * 0.15,
        -3.2 + v * 0.6
      );
      this.vinesSlot.add(clump);
    }
    this.vinesSlot.visible = false;
    this.cabinGroup.add(this.vinesSlot);

    // Upgrade 2: Beacon Brass Lanterns
    this.lanternsSlot = new THREE.Group();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a340, metalness: 0.85, roughness: 0.25 });
    const glowLanternMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff8800, emissiveIntensity: 1.4 });

    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 8), glowLanternMat);
    l1.position.set(1.9, 1.8, 3.4);
    this.lanternsSlot.add(l1);
    const bracket1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.4), brassMat);
    bracket1.position.set(1.7, 1.8, 3.4);
    this.lanternsSlot.add(bracket1);

    const l2 = l1.clone();
    l2.position.set(-1.9, 1.8, 3.4);
    this.lanternsSlot.add(l2);
    const bracket2 = bracket1.clone();
    bracket2.position.set(-1.7, 1.8, 3.4);
    this.lanternsSlot.add(bracket2);

    const lLight1 = new THREE.PointLight(0xff9911, 2.2, 14);
    lLight1.position.set(1.9, 1.8, 3.4);
    this.lanternsSlot.add(lLight1);
    this.lanternLights.push(lLight1);

    const lLight2 = new THREE.PointLight(0xff9911, 2.2, 14);
    lLight2.position.set(-1.9, 1.8, 3.4);
    this.lanternsSlot.add(lLight2);
    this.lanternLights.push(lLight2);

    this.lanternsSlot.visible = false;
    this.cabinGroup.add(this.lanternsSlot);

    // Upgrade 3: Steamer Trunks & Post Sacks
    this.luggageSlot = new THREE.Group();
    const trunkMat1 = new THREE.MeshStandardMaterial({ color: 0x7c3f20, roughness: 0.7 });
    const trunkMat2 = new THREE.MeshStandardMaterial({ color: 0x22495b, roughness: 0.65 });
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xcfc0a5, roughness: 0.9 });

    const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 1.9), trunkMat1);
    t1.position.set(0.6, 3.4, 0.8);
    t1.rotation.y = 0.15;
    t1.castShadow = true;
    this.luggageSlot.add(t1);

    const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.5), trunkMat2);
    t2.position.set(-0.5, 3.35, -0.6);
    t2.rotation.y = -0.22;
    t2.castShadow = true;
    this.luggageSlot.add(t2);

    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.55, 6, 6), sackMat);
    sack.scale.set(1.1, 0.7, 0.9);
    sack.position.set(0.2, 3.35, -1.8);
    sack.castShadow = true;
    this.luggageSlot.add(sack);

    this.luggageSlot.visible = false;
    this.cabinGroup.add(this.luggageSlot);

    // Upgrade 4: Velvet Spring Suspension Dampers
    this.suspensionSlot = new THREE.Group();
    const springGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.2, 8);
    const goldSpringMat = new THREE.MeshStandardMaterial({ color: 0xe6b840, metalness: 0.9, roughness: 0.2 });

    [-1.2, 1.2].forEach(x => {
      const spring = new THREE.Mesh(springGeo, goldSpringMat);
      spring.position.set(x, 0.4, 0);
      this.suspensionSlot.add(spring);
    });
    this.suspensionSlot.visible = false;
    this.group.add(this.suspensionSlot);

    // Upgrade 5: Chiming Steam Whistle
    this.whistleSlot = new THREE.Group();
    const whistleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8), brassMat);
    whistleBase.position.set(0.8, 3.4, 3.2);
    this.whistleSlot.add(whistleBase);

    // Whistle Steam Particle Cloud
    this.steamGeo = new THREE.BufferGeometry();
    const steamCount = 30;
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount * 3; i += 3) {
      steamPos[i] = (Math.random() - 0.5) * 0.4;
      steamPos[i + 1] = Math.random() * 1.5;
      steamPos[i + 2] = (Math.random() - 0.5) * 0.4;
    }
    this.steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.7
    });
    this.steamParticles = new THREE.Points(this.steamGeo, steamMat);
    this.steamParticles.position.set(0.8, 3.9, 3.2);
    this.steamParticles.visible = false;
    this.whistleSlot.add(this.steamParticles);

    this.whistleSlot.visible = false;
    this.cabinGroup.add(this.whistleSlot);

    // Upgrade 6: Cozy Tea Cart
    this.teacartSlot = new THREE.Group();
    const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), brassMat);
    kettle.position.set(-0.8, 1.2, -2.8);
    this.teacartSlot.add(kettle);
    this.teacartSlot.visible = false;
    this.cabinGroup.add(this.teacartSlot);

    // Upgrade 7: Skywave Gramophone
    this.gramophoneSlot = new THREE.Group();
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 8, 1, true), brassMat);
    horn.rotation.x = Math.PI / 2;
    horn.rotation.y = -0.4;
    horn.position.set(-1.8, 2.5, 1.2);
    this.gramophoneSlot.add(horn);
    this.gramophoneSlot.visible = false;
    this.cabinGroup.add(this.gramophoneSlot);

    this.group.add(this.cabinGroup);
  }

  public applyPaintScheme(schemeId: string) {
    const scheme = PAINT_SCHEMES.find(p => p.id === schemeId) || PAINT_SCHEMES[0];
    this.bodyMat.color.setHex(scheme.primaryColor);
    this.chassisMat.color.setHex(scheme.secondaryColor);
    this.roofMat.color.setHex(scheme.roofColor);
    this.trimMat.color.setHex(scheme.trimColor);
  }

  public applyUpgrades(installed: Record<string, boolean>) {
    this.vinesSlot.visible = !!installed['vines'];
    this.lanternsSlot.visible = !!installed['lanterns'];
    this.luggageSlot.visible = !!installed['luggage'];
    this.suspensionSlot.visible = !!installed['suspension'];
    this.whistleSlot.visible = !!installed['whistle'];
    this.teacartSlot.visible = !!installed['teacart'];
    this.gramophoneSlot.visible = !!installed['gramophone'];
  }

  public triggerWhistleSteam() {
    this.steamActive = true;
    this.steamTimer = 1.2;
    if (this.steamParticles) this.steamParticles.visible = true;
  }

  public update(dt: number, speed: number, targetAccel: number, lateralG: number) {
    // 1. Wheel Rotation along rails
    const speedUnits = (speed * 1000) / 3600;
    const wheelRotSpeed = (speedUnits / 0.42) * dt;
    this.wheels.forEach(w => {
      w.rotation.x += wheelRotSpeed;
    });

    // 2. Cabin Dynamic Roll & Pitch (Spring inertia)
    const rumble = (Math.sin(performance.now() * 0.02 * (speed + 1)) * 0.012) * (speed / 45);
    const targetRoll = -lateralG * 0.14 + rumble;
    const targetPitch = (targetAccel / 30) * 0.07;

    this.cabinGroup.rotation.z = THREE.MathUtils.lerp(this.cabinGroup.rotation.z, targetRoll, 0.12);
    this.cabinGroup.rotation.x = THREE.MathUtils.lerp(this.cabinGroup.rotation.x, targetPitch, 0.12);

    // 3. Steam particle rise on whistle
    if (this.steamActive) {
      this.steamTimer -= dt;
      if (this.steamParticles) {
        const pos = this.steamGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] += dt * 1.8;
          if (pos[i] > 2.0) pos[i] = 0;
        }
        this.steamGeo.attributes.position.needsUpdate = true;
      }

      if (this.steamTimer <= 0) {
        this.steamActive = false;
        if (this.steamParticles) this.steamParticles.visible = false;
      }
    }
  }
}
