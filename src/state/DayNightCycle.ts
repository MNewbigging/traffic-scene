import * as THREE from 'three';
import { WorldClock } from './WorldClock';
/**
 * Responsible for managing the day-night cycle. Creates the directional light
 * for the sun and its target, moves across the scene and provides methods to
 * set the current time.
 *
 * There needs to be different qualities to the light based on the time of day.
 * There needs to be a different light position based on the time of day.
 *
 * The light should follow points along a curve til the end, then fade out.
 * Then it starts again from the same beginning on the curve, after a delay.
 *
 * This means that the light position, intensity and colour is relative to the
 * current time of day.
 */
export class DayNightCycle {
  private sunLight: THREE.DirectionalLight;
  private trajectoryPoints: THREE.Vector3[] = [];

  constructor(private scene: THREE.Scene, private worldClock: WorldClock) {
    this.createSun();
    this.trajectoryLine();
  }

  public update(deltaTime: number) {
    //this.sunLight.position.x -= deltaTime * 3;
  }

  private trajectoryLine() {
    const points = [
      new THREE.Vector3(-50, 10, 5),
      new THREE.Vector3(0, 50, 5),
      new THREE.Vector3(50, 10, 5),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(50);
    this.trajectoryPoints = curvePoints;

    const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const mat = new THREE.LineBasicMaterial({ color: 'blue' });
    const trajectory = new THREE.Line(geom, mat);

    this.scene.add(trajectory);
  }

  private createSun() {
    const directionalLight = new THREE.DirectionalLight(0xfceea7, 1);
    directionalLight.position.x = 20;
    directionalLight.position.y = 20;
    directionalLight.position.z = 10;
    directionalLight.target.position.x = 8;
    directionalLight.target.position.z = -4;
    // Shadow props for light
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.0007; // Magic number
    this.sunLight = directionalLight;

    const sunGroup = new THREE.Group();
    sunGroup.name = 'SunGroup';
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    sunGroup.add(helper);
    sunGroup.add(directionalLight);
    sunGroup.add(directionalLight.target);
    this.scene.add(sunGroup);
  }
}
