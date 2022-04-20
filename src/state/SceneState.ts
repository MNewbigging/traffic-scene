import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Pathfinder } from '../utils/Pathfinder';
import { Road } from '../model/Road';
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

    //this.bendRoadScene();
    //this.lanesTestScene();
    this.refPointsScene();

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

  private refPointsScene() {
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
    const b1 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const roads = [s1, s2, s3, b1];

    // Position roads
    s2.position.z = -2;
    s3.position.z = -4;
    b1.position.z = -6;
    b1.rotation.y = -Math.PI / 2;

    // Generate lane data ater moving roads
    roads.forEach((r) => r.postTransform());

    // Connect all roads
    s1.connectRoads([s2]);
    s2.connectRoads([s1, s3]);
    s3.connectRoads([s2, b1]);
    b1.connectRoads([s3]);

    // Route
    const route = Pathfinder.findRoute(s1, b1);
    const waypoints = Pathfinder.getRouteWaypoints(route);
    console.log('waypoints', waypoints);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    this.vehicles.push(car);

    // Another route
    const route2 = Pathfinder.findRoute(b1, s1);
    const waypoints2 = Pathfinder.getRouteWaypoints(route2);
    const car2 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car2.setRouteWaypoints(waypoints2);
    car2.model.position.x = waypoints2[0].x;
    car2.model.position.z = waypoints2[0].z;
    this.vehicles.push(car2);

    // Add to scene
    this.scene.add(car2.model);
    this.scene.add(car2.routeLine);
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
    roads.forEach((r) => {
      this.scene.add(r.model);
      this.scene.add(r.edgePoints);
      r.lanes.forEach((l) => this.scene.add(l.line));
    });
  }
}
