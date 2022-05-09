import * as THREE from 'three';

import { CameraManager } from './cameras/CameraManager';
import { DayNightCycle } from './DayNightCycle';
import { GameEventListener, GameEventType } from './listeners/GameEventListener';
import { ModelLoader } from '../loaders/ModelLoader';
import { MouseListener } from './listeners/MouseListener';
import { Prop } from '../model/Prop';
import { Road } from '../model/Road';
import { SceneBuilder } from '../utils/SceneBuilder';
import { Vehicle } from '../model/Vehicle';
import { VehicleUtils } from '../utils/VehicleUtils';
import { WorldClock } from './WorldClock';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  private dayNightCycle: DayNightCycle;
  private roads: Road[] = [];
  private vehicles: Vehicle[] = [];
  private props: Prop[] = [];

  constructor(
    private scene: THREE.Scene,
    private cameraManager: CameraManager,
    private worldClock: WorldClock,
    private mouseListener: MouseListener,
    private modelLoader: ModelLoader,
    private gameEventListener: GameEventListener
  ) {
    mouseListener.on('leftclickup', this.onLeftClick);
    mouseListener.on('rightclickdown', this.onRightClick);
    this.dayNightCycle = new DayNightCycle(this.scene, this.worldClock);
  }

  public updateScene(deltaTime: number) {
    // Check vehicle collisions
    VehicleUtils.checkCollisions(this.vehicles);

    // Update vehicles
    this.vehicles.forEach((v) => v.update(deltaTime));

    // Day nigtht cycle
    this.dayNightCycle.update(deltaTime);
  }

  // Once models are loaded, can then piece them together as per scene
  public buildScene() {
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
  }

  private setupLights() {
    // Ambient
    const ambientLight = new THREE.HemisphereLight(0xebf6ff, 0x5fa36b, 0.25);
    this.scene.add(ambientLight);
  }

  private onRightClick = () => {
    // Clear the target vehicle
    //this.targetVehicle = undefined;
  };

  private onLeftClick = () => {
    // Determine if clicked on a selectable object
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouseListener.screenPos, this.cameraManager.camera);

    for (const vehicle of this.vehicles) {
      const intersects = raycaster.intersectObject(vehicle.bounds);
      if (intersects.length) {
        this.gameEventListener.fireEvent({ type: GameEventType.SELECTED_VEHICLE, vehicle });
        break;
      }
    }
  };
}
