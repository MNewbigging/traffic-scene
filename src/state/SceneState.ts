import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { HouseName, ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { MouseListener } from '../utils/MouseListener';
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
  public roads: Road[] = [];
  public vehicles: Vehicle[] = [];
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

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const sceneBuilder = new SceneBuilder(this.modelLoader);

    this.roads = sceneBuilder.buildRoads();
    this.vehicles = sceneBuilder.buildVehicles();

    // Add all the objects to the scene
    this.roads.forEach((r) => this.scene.add(r.model));
    this.vehicles.forEach((v) => this.scene.add(v.model));

    // Now ready to start
    this.onReady?.();
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
    this.controls.target.x = 8;
    this.controls.target.z = -4;
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
