import * as THREE from 'three';
import type { CameraMode } from '../../types/game';

const BASE_FOV = 50;
const MAX_SPEED_KMH = 65;

export class CameraController {
  private orbitAngle = 0;
  private pitchAngle = 0.2;
  private isDragging = false;
  private previousPointerX = 0;
  private previousPointerY = 0;
  private readonly smoothedLookTarget = new THREE.Vector3();
  private hasLookTarget = false;

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
    dt: number,
    speedKmh: number,
    acceleration: number,
    lateralForce: number,
  ) {
    const speedRatio = THREE.MathUtils.clamp(speedKmh / MAX_SPEED_KMH, 0, 1);

    if (isWorkshopMode) {
      this.updateWorkshopCamera(dt);
      this.updateFov(47, dt);
      return;
    }

    this.updateFov(this.getTargetFov(cameraMode, speedRatio), dt);

    switch (cameraMode) {
      case 'chase':
        this.updateChaseCamera(
          tramPosition,
          tramTangent,
          tramQuaternion,
          time,
          dt,
          speedRatio,
          lateralForce,
        );
        return;
      case 'cab':
        this.updateCabCamera(
          tramPosition,
          tramTangent,
          tramQuaternion,
          time,
          dt,
          speedRatio,
          acceleration,
        );
        return;
      case 'passenger':
        this.updatePassengerCamera(
          tramPosition,
          tramTangent,
          tramQuaternion,
          time,
          dt,
          speedRatio,
        );
        return;
      case 'scenic':
        this.updateScenicCamera(tramPosition, tramTangent, time, dt, speedRatio);
        return;
      case 'birds_eye':
        this.updateBirdsEyeCamera(tramPosition, tramTangent, dt);
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
    this.pitchAngle = THREE.MathUtils.clamp(
      this.pitchAngle + deltaY * 0.004,
      0.05,
      1.2,
    );
    this.previousPointerX = event.clientX;
    this.previousPointerY = event.clientY;
  };

  private readonly handlePointerUp = () => {
    this.isDragging = false;
  };

  private updateWorkshopCamera(dt: number) {
    this.applyCamera(
      new THREE.Vector3(24, 28, 168),
      new THREE.Vector3(0, 18, 140),
      dt,
      5,
      6,
    );
  }

  private updateChaseCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuaternion: THREE.Quaternion,
    time: number,
    dt: number,
    speedRatio: number,
    lateralForce: number,
  ) {
    const distance = 18 + speedRatio * 5;
    const height = 7 + this.pitchAngle * 6 + speedRatio * 1.2;
    const cornerShift = THREE.MathUtils.clamp(lateralForce * 0.55, -1.5, 1.5);

    const localOffset = new THREE.Vector3(
      Math.sin(this.orbitAngle) * distance + cornerShift,
      height,
      Math.cos(this.orbitAngle) * -distance - 8,
    ).applyQuaternion(tramQuaternion);

    const speedRumble = Math.sin(time * 0.019) * 0.05 * speedRatio;
    const targetPosition = tramPosition
      .clone()
      .add(localOffset)
      .add(new THREE.Vector3(0, speedRumble, 0));

    targetPosition.y = Math.max(targetPosition.y, tramPosition.y + 1.8);

    const lookTarget = tramPosition
      .clone()
      .addScaledVector(tramTangent, 7 + speedRatio * 11)
      .add(new THREE.Vector3(0, 1.1, 0));

    this.applyCamera(targetPosition, lookTarget, dt, 6.5, 8.5);
  }

  private updateCabCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuaternion: THREE.Quaternion,
    time: number,
    dt: number,
    speedRatio: number,
    acceleration: number,
  ) {
    const rumble =
      Math.sin(time * 0.025) * 0.025 * speedRatio +
      THREE.MathUtils.clamp(-acceleration * 0.0012, -0.025, 0.025);

    const targetPosition = tramPosition.clone().add(
      new THREE.Vector3(0, 0.35 + rumble, 2.8).applyQuaternion(tramQuaternion),
    );
    const lookTarget = targetPosition
      .clone()
      .addScaledVector(tramTangent, 17 + speedRatio * 9);

    this.applyCamera(targetPosition, lookTarget, dt, 15, 16);
  }

  private updatePassengerCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    tramQuaternion: THREE.Quaternion,
    time: number,
    dt: number,
    speedRatio: number,
  ) {
    const sway = Math.sin(time * 0.0045) * 0.025 * speedRatio;
    const targetPosition = tramPosition.clone().add(
      new THREE.Vector3(1.4, 0.2 + sway, 0).applyQuaternion(tramQuaternion),
    );
    const sideView = new THREE.Vector3(1.1, -0.05, 0.35)
      .applyQuaternion(tramQuaternion)
      .normalize();
    const lookTarget = targetPosition
      .clone()
      .add(sideView.multiplyScalar(20))
      .addScaledVector(tramTangent, 3);

    this.applyCamera(targetPosition, lookTarget, dt, 13, 12);
  }

  private updateScenicCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    time: number,
    dt: number,
    speedRatio: number,
  ) {
    const angle = time * (0.00018 + speedRatio * 0.00006);
    const radius = 42 + speedRatio * 7;
    const targetPosition = new THREE.Vector3(
      tramPosition.x + Math.sin(angle) * radius,
      tramPosition.y + 21 + speedRatio * 4,
      tramPosition.z + Math.cos(angle) * radius,
    );
    const lookTarget = tramPosition
      .clone()
      .addScaledVector(tramTangent, 5 + speedRatio * 5);

    this.applyCamera(targetPosition, lookTarget, dt, 4.5, 6);
  }

  private updateBirdsEyeCamera(
    tramPosition: THREE.Vector3,
    tramTangent: THREE.Vector3,
    dt: number,
  ) {
    const targetPosition = new THREE.Vector3(
      tramPosition.x,
      tramPosition.y + 75,
      tramPosition.z + 20,
    );
    const lookTarget = tramPosition.clone().addScaledVector(tramTangent, 5);
    this.applyCamera(targetPosition, lookTarget, dt, 5, 7);
  }

  private applyCamera(
    targetPosition: THREE.Vector3,
    lookTarget: THREE.Vector3,
    dt: number,
    positionResponsiveness: number,
    lookResponsiveness: number,
  ) {
    const positionAlpha = 1 - Math.exp(-positionResponsiveness * dt);
    const lookAlpha = 1 - Math.exp(-lookResponsiveness * dt);

    this.camera.position.lerp(targetPosition, positionAlpha);

    if (!this.hasLookTarget) {
      this.smoothedLookTarget.copy(lookTarget);
      this.hasLookTarget = true;
    } else {
      this.smoothedLookTarget.lerp(lookTarget, lookAlpha);
    }

    this.camera.lookAt(this.smoothedLookTarget);
  }

  private getTargetFov(cameraMode: CameraMode, speedRatio: number): number {
    switch (cameraMode) {
      case 'chase':
        return BASE_FOV + speedRatio * 7;
      case 'cab':
        return BASE_FOV + speedRatio * 5;
      case 'passenger':
        return BASE_FOV + speedRatio * 2.5;
      case 'scenic':
        return BASE_FOV + speedRatio * 3.5;
      case 'birds_eye':
        return 48;
    }
  }

  private updateFov(targetFov: number, dt: number) {
    const alpha = 1 - Math.exp(-3.5 * dt);
    const nextFov = THREE.MathUtils.lerp(this.camera.fov, targetFov, alpha);

    if (Math.abs(nextFov - this.camera.fov) < 0.001) return;

    this.camera.fov = nextFov;
    this.camera.updateProjectionMatrix();
  }
}
