import * as THREE from 'three';

export class SkyParcelSystem {
  private readonly parcels: THREE.Group[] = [];

  constructor(
    private readonly scene: THREE.Scene,
    private readonly trackCurve: THREE.CatmullRomCurve3,
  ) {
    this.build();
  }

  collectAt(trackPos: number): number {
    let earned = 0;
    for (const parcel of this.parcels) {
      if (parcel.userData.collected) continue;
      const distance = Math.abs(trackPos - parcel.userData.u);
      const wrapsAroundTrack = parcel.userData.u > 0.98 && trackPos < 0.012;
      if (distance >= 0.012 && !wrapsAroundTrack) continue;

      parcel.userData.collected = true;
      parcel.visible = false;
      earned += parcel.userData.value;
    }
    return earned;
  }

  respawn() {
    for (const parcel of this.parcels) {
      parcel.userData.collected = false;
      parcel.visible = true;
    }
  }

  update(dt: number, time: number) {
    for (const parcel of this.parcels) {
      if (parcel.userData.collected) continue;
      parcel.rotation.y += 1.8 * dt;
      parcel.position.y += Math.sin(time * 0.004 + parcel.userData.id) * 0.008;
    }
  }

  private build() {
    const parcelGeometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const parcelMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a340,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xc2593f });
    const locations = [0.18, 0.45, 0.72, 0.92, 0.26];

    locations.forEach((trackPosition, id) => {
      const point = this.trackCurve.getPointAt(trackPosition);
      const group = new THREE.Group();
      group.position.set(point.x, point.y - 2, point.z);

      const box = new THREE.Mesh(parcelGeometry, parcelMaterial);
      box.castShadow = true;
      group.add(box);
      group.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), ribbonMaterial));

      group.userData = { id, u: trackPosition, collected: false, value: 35 };
      this.parcels.push(group);
      this.scene.add(group);
    });
  }
}
