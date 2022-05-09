import * as THREE from 'three';
import { WorldClock } from './WorldClock';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { IUniform } from 'three';
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

// interface SkyUniforms {
//   turbidity: IUniform;
//   rayleigh: IUniform;
//   minCoefficient: IUniform;
//   mieDirectionalG: IUniform;
//   elevation: number;
//   azimuth: number;
//   exposure: IUniform;
//   phi: number;
//   theta: number;
// }

export class DayNightCycle {
  private sunLight: THREE.DirectionalLight;
  private trajectoryPoints: THREE.Vector3[] = [];
  private sky: Sky;
  private skyUniforms: any;

  constructor(private scene: THREE.Scene, private worldClock: WorldClock) {
    this.createSun();
    this.trajectoryLine();
  }

  public update(deltaTime: number) {
    //this.sunLight.position.x -= deltaTime * 3;

    const progress = (this.worldClock.hours + (this.worldClock.minutes / 60)) / 24;
    const rotation = progress; // Radians

    //const horzRotation = THREE.MathUtils.radToDeg(rotation);
    //console.log(progress);
    //this.skyUniforms.phi = THREE.MathUtils.degToRad( vertRotation );
    //this.skyUniforms.phi = -Math.sin(progress * Math.PI);
    //this.skyUniforms.theta = 1 - Math.sin(progress * Math.PI);
    //this.skyUniforms.theta = THREE.MathUtils.degToRad( horzRotation);

    //this.sunLight.intensity = Math.max(0, Math.min((progress * 2) - 0.5, 1));
    // 0 - midnight
    // 0.5 daylight
    // 1 - midnight

    // -1
    // 0
    // 1
    
    this.sunLight.intensity = Math.sin(progress * (Math.PI));
    console.log(this.sunLight.intensity);

    this.skyUniforms.elevation = THREE.MathUtils.radToDeg(progress) * (Math.PI * 2);
    this.skyUniforms.azimuth = -THREE.MathUtils.radToDeg(progress) * (Math.PI * 2);

    this.skyUniforms.phi = THREE.MathUtils.degToRad( 180 - this.skyUniforms.elevation);
    this.skyUniforms.theta = THREE.MathUtils.degToRad( this.skyUniforms.azimuth);

    this.sunLight.position.setFromSphericalCoords(1, this.skyUniforms.phi, this.skyUniforms.theta);
    //this.sunLight.position.setFromSphericalCoords(1, this.skyUniforms.elevation, this.skyUniforms.azimuth);
    this.sunLight.position.multiplyScalar(15);
    this.sunLight.target.position.set(0,0,0);
    this.skyUniforms[ 'sunPosition' ].value.copy( this.sunLight.position );
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
    this.sky = new Sky();
    this.sky.scale.setScalar( 450000 );
    this.scene.add( this.sky );
    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms.elevation = 15;
    this.skyUniforms.azimuth = 15;
    // this.skyUniforms.azimuth = 0;
    // this.skyUniforms.elevation = 0;
    // this.skyUniforms.turbidity = this.sky.material.uniforms.turbidity;
    // this.skyUniforms.rayleigh = this.sky.material.uniforms.rayleigh;
    // this.skyUniforms.minCoefficient = this.sky.material.uniforms.minCoefficient;
    // this.skyUniforms.exposure = this.sky.material.uniforms.exposure;

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
