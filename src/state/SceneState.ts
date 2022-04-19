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

    this.bendRoadScene();
    //this.lanesTestScene();

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

  private bendRoadScene() {
    const s1 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b1 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const s2 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b2 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const s3 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b3 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const s4 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b4 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));

    const roads = [s1, b1, s2, b2, s3, b3, s4, b4];

    b1.position.z = -2;
    s2.position.z = -2;
    s2.position.x = 2;
    s2.rotation.y = Math.PI / 2;
    b2.position.z = -2;
    b2.position.x = 4;
    b2.rotation.y = -Math.PI / 2;
    s3.position.x = 4;
    b3.position.z = 2;
    b3.position.x = 4;
    b3.rotation.y = Math.PI;
    s4.position.x = 2;
    s4.position.z = 2;
    s4.rotation.y = Math.PI / 2;
    b4.position.z = 2;
    b4.rotation.y = Math.PI / 2;

    // Update lane lines after positioning
    roads.forEach((r) => r.generateLaneWaypoints());

    // Connect
    s1.neighbours.push(b1);
    b1.neighbours.push(s1);
    b1.neighbours.push(s2);
    s2.neighbours.push(b1);
    s2.neighbours.push(b2);
    b2.neighbours.push(s2);
    b2.neighbours.push(s3);
    s3.neighbours.push(b2);
    s3.neighbours.push(b3);
    b3.neighbours.push(s3);
    b3.neighbours.push(s4);
    s4.neighbours.push(b3);
    s4.neighbours.push(b4);

    // Find a route
    const route = Pathfinder.findRoute(s1, s4);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    this.vehicles.push(car);

    // Second car
    const route2 = Pathfinder.findRoute(s4, s1);
    const waypoints2 = Pathfinder.getRouteWaypoints(route2);
    const car2 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car2.setRouteWaypoints(waypoints2);
    car2.model.position.x = waypoints2[0].x;
    car2.model.position.z = waypoints2[0].z;
    this.vehicles.push(car2);

    // Add to scene
    roads.forEach((r) => {
      this.scene.add(r.model);
      this.scene.add(r.leftLane);
      this.scene.add(r.rightLane);
    });
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
    this.scene.add(car2.model);
    this.scene.add(car2.routeLine);

    this.controls.target = new THREE.Vector3(2, 0, 0);
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
    s1.rotation.y = Math.PI / 2;
    s2.rotation.y = Math.PI / 2;
    s3.rotation.y = Math.PI / 2;

    s2.position.x = 2;
    s3.position.x = 4;

    // Create lane lines
    [s1, s2, s3].forEach((s) => s.generateLaneWaypoints());

    // Connect them
    s1.neighbours.push(s2);
    s2.neighbours.push(s1);
    s2.neighbours.push(s3);
    s3.neighbours.push(s2);

    // Find a route for first car
    const route: Road[] = Pathfinder.findRoute(s3, s1);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;

    const route2 = Pathfinder.findRoute(s1, s3);
    const waypoints2 = Pathfinder.getRouteWaypoints(route2);
    const car2 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car2.setRouteWaypoints(waypoints2);
    car2.model.position.x = waypoints2[0].x;
    car2.model.position.z = waypoints2[0].z;

    // Add to scene
    this.vehicles.push(car);
    this.vehicles.push(car2);
    [s1, s2, s3].forEach((s) => {
      this.scene.add(s.model);
      this.scene.add(s.leftLane);
      this.scene.add(s.rightLane);
    });
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
    this.scene.add(car2.model);
    this.scene.add(car2.routeLine);

    this.controls.target = new THREE.Vector3(2, 0, 0);
  }
}
