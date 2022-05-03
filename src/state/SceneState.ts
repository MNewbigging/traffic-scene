import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { HouseName, ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { MouseListener } from '../utils/MouseListener';
import { Prop } from '../model/Prop';
import { Road } from '../model/Road';
import { SceneBuilder } from '../utils/SceneBuilder';
import { Vehicle } from '../model/Vehicle';
import { VehicleUtils } from '../utils/VehicleUtils';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  public scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera;
  private roads: Road[] = [];
  private vehicles: Vehicle[] = [];
  private props: Prop[] = [];
  private targetVehicle?: Vehicle;
  private controls: OrbitControls;
  private modelLoader = new ModelLoader();
  private onReady?: () => void;

  constructor(private canvasListener: CanvasListener, private mouseListener: MouseListener) {
    canvasListener.addCanvasListener(this.onCanvasResize);
    mouseListener.on('leftclickup', this.onLeftClick);
    mouseListener.on('rightclickdown', this.onRightClick);
  }

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    const modelNames = new ModelNames();
    modelNames.roads = Object.values(RoadName);
    modelNames.vehicles = Object.values(VehicleName);
    modelNames.houses = Object.values(HouseName);

    this.modelLoader.loadModels(modelNames, () => this.buildScene());
  }

  public updateScene(deltaTime: number) {
    // Update camera and controls
    this.controls.update();
    if (this.targetVehicle) {
      this.controls.target.set(
        this.targetVehicle.position.x,
        this.targetVehicle.position.y,
        this.targetVehicle.position.z
      );
    }

    // Check vehicle collisions
    VehicleUtils.checkCollisions(this.vehicles);

    // Update vehicles
    this.vehicles.forEach((v) => v.update(deltaTime));
  }

  private onCanvasResize = () => {
    this.camera.aspect = this.canvasListener.width / this.canvasListener.height;
    this.camera.updateProjectionMatrix();
  };

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    this.setupCamera();
    this.setupLights();

    // Build the scene objects
    const sceneBuilder = new SceneBuilder(this.modelLoader);

    this.roads = sceneBuilder.buildRoads();
    this.vehicles = sceneBuilder.buildVehicles();

    sceneBuilder.buildHouses().forEach((h) => this.props.push(h));

    // Add all the objects to the scene
    this.roads.forEach((r) => this.scene.add(r.model));
    this.vehicles.forEach((v) => this.scene.add(v.model));
    this.props.forEach((p) => this.scene.add(p.model));

    // Now ready to start
    this.onReady?.();
  }

  private setupLights() {
    // Ambient
    const ambientLight = new THREE.HemisphereLight(0xebf6ff, 0x5fa36b, 0.25);
    this.scene.add(ambientLight);

    // Directional
    const directionalLight = new THREE.DirectionalLight(0xfceea7, 1);
    directionalLight.position.x = 10;
    directionalLight.position.y = 10;
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
    directionalLight.shadow.bias = - 0.0007; // Magic number

    const sunGroup = new THREE.Group();
    sunGroup.name = 'SunGroup';
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    sunGroup.add(helper);
    sunGroup.add(directionalLight);
    sunGroup.add(directionalLight.target);
    this.scene.add(sunGroup);
  }

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 8;
    camera.position.y = 15;
    camera.position.z = 8;
    this.camera = camera;

    this.controls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.controls.enableDamping = true;
    // Target the roundabout by default
    this.controls.target.x = 8;
    this.controls.target.z = -4;
    // Prevent going below ground level
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  private onRightClick = () => {
    // Clear the target vehicle
    this.targetVehicle = undefined;
  };

  private onLeftClick = () => {
    // Determine if clicked on a selectable object
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouseListener.screenPos, this.camera);

    for (const vehicle of this.vehicles) {
      const intersects = raycaster.intersectObject(vehicle.bounds);
      if (intersects.length) {
        this.targetVehicle = vehicle;
        break;
      }
    }
  };
}
