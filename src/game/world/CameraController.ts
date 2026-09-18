import * as THREE from 'three';
import type { CameraMode } from '../../types/game';

export class CameraController {
  private orbitAngle = 0;
  private pitchAngle = 0.2;
  private isDragging = false;
  private previousPointerX = 0;
  private previousPointerY = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly container: HTMLElement,
  ) {
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  update(
    cameraMode: CameraMode,
    isWorkshopMode: boolean,
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuaternion: THREE.Quaternion,
    time: number,
  ) {
    if (isWorkshopMode) {
      this.camera.position.lerp(new THREE.Vector3(24, 28, 168), 0.06);
      this.camera.lookAt(new THREE.Vector3(0, 18, 140));
      return;
    }

    switch (cameraMode) {
      case 'chase':
        this.updateChaseCamera(tramPosition, tramQuaternion);
        return;
      case 'cab':
        this.updateCabCamera(tramPosition, tramTangent, tramQuaternion);
        return;
      case 'passenger':
        this.updatePassengerCamera(tramPosition, tramQuaternion);
        return;
      case 'scenic':
        this.updateScenicCamera(tramPosition, time);
        return;
      case 'birds_eye':
        this.updateBirdsEyeCamera(tramPosition);
        return;
    }
  }

  dispose() {
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
  }

  private readonly handlePointerDown = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest('.interactive')) return;
    this.isDragging = true;
    this.previousPointerX = event.clientX;
    this.previousPointerY = event.clientY;
  };

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.previousPointerX;
    const deltaY = event.clientY - this.previousPointerY;
    this.orbitAngle -= deltaX * 0.006;
    this.pitchAngle = Math.max(0.05, Math.min(1.2, this.pitchAngle + deltaY * 0.004));
    this.previousPointerX = event.clientX;
    this.previousPointerY = event.clientY;
  };

  private readonly handlePointerUp = () => {
    this.isDragging = false;
  };

  private updateChaseCamera(tramPosition: THREE.Vector3, tramQuaternion: THREE.Quaternion) {
    const distance = 18;
    const height = 7 + this.pitchAngle * 6;
    const offset = new THREE.Vector3(
      Math.sin(this.orbitAngle) * distance,
      height,
      Math.cos(this.orbitAngle) * -distance - 8,
    ).applyQuaternion(tramQuaternion);

    const targetPosition = tramPosition.clone().add(offset);
    targetPosition.y = Math.max(targetPosition.y, tramPosition.y + 1.8);
    this.camera.position.lerp(targetPosition, 0.08);
    this.camera.lookAt(tramPosition.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }

  private updateCabCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuaternion: THREE.Quaternion,
  ) {
    const cameraPosition = tramPosition.clone().add(
      new THREE.Vector3(0, 0.35, 2.8).applyQuaternion(tramQuaternion),
    );
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(cameraPosition.clone().add(tramTangent.clone().multiplyScalar(15)));
  }

  private updatePassengerCamera(tramPosition: THREE.Vector3, tramQuaternion: THREE.Quaternion) {
    const cameraPosition = tramPosition.clone().add(
      new THREE.Vector3(1.4, 0.2, 0).applyQuaternion(tramQuaternion),
    );
    const lookDirection = new THREE.Vector3(1.2, -0.1, 0.5).applyQuaternion(tramQuaternion);
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(cameraPosition.clone().add(lookDirection.multiplyScalar(20)));
  }

  private updateScenicCamera(tramPosition: THREE.Vector3, time: number) {
    const angle = time * 0.00025;
    const targetPosition = new THREE.Vector3(
      tramPosition.x + Math.sin(angle) * 44,
      tramPosition.y + 22,
      tramPosition.z + Math.cos(angle) * 44,
    );
    this.camera.position.lerp(targetPosition, 0.05);
    this.camera.lookAt(tramPosition);
  }

  private updateBirdsEyeCamera(tramPosition: THREE.Vector3) {
    this.camera.position.lerp(
      new THREE.Vector3(tramPosition.x, tramPosition.y + 75, tramPosition.z + 20),
      0.06,
    );
    this.camera.lookAt(tramPosition);
  }
}
