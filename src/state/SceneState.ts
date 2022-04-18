import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Pathfinder } from '../utils/Pathfinder';
import { Road, RoadWaypoint } from '../model/Road';
import { RoadFactory } from '../utils/RoadFactory';
import { Vehicle } from '../model/Vehicle';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  public scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera;
  public roads: Road[] = [];
  public vehicles: Vehicle[] = [];

  private controls: OrbitControls;
  private modelLoader = new ModelLoader();
  private onReady?: () => void;

  private arrow: THREE.ArrowHelper;

  constructor(private canvasListener: CanvasListener) {}

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    // Work out which models we need to load for this scene
    // This is where proc gen comes in - hardcoded for now
    const modelNames = new ModelNames();
    modelNames.roads = [RoadName.END, RoadName.STRAIGHT, RoadName.BEND];
    modelNames.vehicles = [VehicleName.SEDAN];

    this.modelLoader.loadModels(modelNames, () => this.buildScene());
  }

  public updateScene(deltaTime: number) {
    //this.controls.target = this.vehicles[0].position;
    this.controls.update();

    // Move vehicles along their route
    this.vehicles.forEach((v) => v.update(deltaTime));
  }

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    this.setupCamera();

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.lanesTestScene();

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
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 2;

    this.camera = camera;
    this.controls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.controls.enableDamping = true;
  }

  private lanesTestScene() {
    // Build roads
    const s1 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const s2 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const s3 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );

    // Position them
    s1.postTransform();
    s2.setPosition('z', -2);
    s3.setPosition('z', -4);

    // Connect them
    s1.neighbours.push(s2);
    s2.neighbours.push(s1);
    s2.neighbours.push(s3);
    s3.neighbours.push(s2);

    // Find a route from s1 to s3
    const route: Road[] = Pathfinder.findRoute(s1, s3);
    const travelDir = route[1].position.clone().sub(route[0].position).normalize();
    const waypoints = Pathfinder.getRouteWaypoints(route, travelDir);
    console.log('road waypoints', waypoints);
    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);

    // Setup car's starting pos
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    car.model.lookAt(travelDir);

    // Add to scene
    this.vehicles.push(car);
    [s1, s2, s3].forEach((s) => {
      this.scene.add(s.model);
      this.scene.add(s.leftLane);
      this.scene.add(s.rightLane);
    });
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
  }
}
