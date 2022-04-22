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
    modelNames.roads = [
      RoadName.STRAIGHT,
      RoadName.BEND,
      RoadName.JUNCTION,
      RoadName.CROSSROAD,
      RoadName.ROUNDABOUT,
    ];
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

    //this.junctionScene();
    //this.crossroadScene();
    this.roundaboutScene();

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

  private roundaboutScene() {
    // Roundabout, route towards z
    const r1 = this.addRoad(RoadName.ROUNDABOUT, new THREE.Vector3());
    const s1 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, 4));
    const j1 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(0, 0, 6), Math.PI / 2);
    const s5 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, 6), Math.PI / 2);
    const s6 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 6), Math.PI / 2);
    const b1 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, 6), Math.PI / 2); // turns bend, goes towards -z now
    const s7 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, 4));
    const s8 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, 2)); // this meets j2 to left of roundabout

    // Route going above roundabout, towards -z
    const b2 = this.addRoad(RoadName.BEND, new THREE.Vector3(0, 0, -4), -Math.PI / 2);

    // Route going left of roundabout, then up
    const s3 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 0), -Math.PI / 2);
    const j2 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(-6, 0, 0));
    const s9 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -2));
    const b3 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, -4));
    const s10 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, -4), Math.PI / 2);
    const s11 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, -4), Math.PI / 2);

    // Route going right of roundabout, towards x
    const s4 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, 0), -Math.PI / 2);

    [r1, s1, b2, s3, s4, j1, s5, s6, b1, s7, j2, s8, s9, b3, s10, s11].forEach((r) =>
      this.roads.push(r)
    );

    // Connect all roads
    // Roundabout
    r1.connectRoads([s1, b2, s3, s4]);
    // route towards z, bends back up towards -z
    s1.connectRoads([r1, j1]);
    j1.connectRoads([s1, s5]);
    s5.connectRoads([j1, s6]);
    s6.connectRoads([s5, b1]);
    b1.connectRoads([s6, s7]);
    s7.connectRoads([b1, s8]);
    s8.connectRoads([s7, j2]);
    // Above connects with side route towards -x:
    s3.connectRoads([r1, j2]);
    j2.connectRoads([s3, s8, s9]);
    s9.connectRoads([j2, b3]);
    b3.connectRoads([s9, s10]);
    s10.connectRoads([b3, s11]);
    s11.connectRoads([s10, b2]);

    // Above roundabove, heading towards -z
    b2.connectRoads([r1, s11]);

    // Right of roundabout, heading towards x
    s4.connectRoads([r1]);

    // Route
    this.addCarWithRoute(s1, s5, new THREE.Color('#2354a1'));
    this.addCarWithRoute(s8, b2, new THREE.Color('green'));

    this.vehicles.forEach((v) => {
      this.scene.add(v.model);
      this.scene.add(v.routeLine);
    });

    this.roads.forEach((r) => {
      this.scene.add(r.model);
    });
  }

  private crossroadScene() {
    const c1 = RoadFactory.createRoad(
      RoadName.CROSSROAD,
      this.modelLoader.getModel(RoadName.CROSSROAD)
    );
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
    const s4 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    [c1, s1, s2, s3, s4].forEach((r) => this.roads.push(r));

    // Position
    s1.position.z = 2;
    s2.position.z = -2;
    s3.position.x = -2;
    s3.rotation.y = Math.PI / 2;
    s4.position.x = 2;
    s4.rotation.y = Math.PI / 2;

    // Update
    this.roads.forEach((r) => r.postTransform());

    // Connect
    [s1, s2, s3, s4].forEach((r) => r.connectRoads([c1]));
    c1.connectRoads([s1, s2, s3, s4]);

    // Route
    const route = Pathfinder.findRoute(s2, s3);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    car.updateRouteLine();
    this.vehicles.push(car);

    this.vehicles.forEach((v) => {
      this.scene.add(v.model);
      this.scene.add(v.routeLine);
    });
    this.roads.forEach((r) => {
      this.scene.add(r.model);
      this.scene.add(r.edgePoints);
      r.lanes.forEach((l) => this.scene.add(l.line));
    });
  }

  private junctionScene() {
    const s1 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const s2 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b1 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const j1 = RoadFactory.createRoad(
      RoadName.JUNCTION,
      this.modelLoader.getModel(RoadName.JUNCTION)
    );
    const b2 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const roads = [b2, b1, j1, s1, s2];

    // Position
    b2.position.x = 2;
    b2.rotation.y = -Math.PI / 2;
    b1.rotation.y = Math.PI / 2;
    j1.position.z = -2;

    s1.position.z = -4;
    s2.position.z = -2;
    s2.rotation.y = Math.PI / 2;
    s2.position.x = 2;

    // Update
    roads.forEach((r) => r.postTransform());

    // Connect
    b2.connectRoads([b1]);
    b1.connectRoads([b2, j1]);
    j1.connectRoads([b1, s1, s2]);
    s1.connectRoads([j1]);
    s2.connectRoads([j1]);

    // Route
    const route = Pathfinder.findRoute(b2, s2);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    car.updateRouteLine();
    this.vehicles.push(car);

    // Route
    const route2 = Pathfinder.findRoute(s2, s1);
    const waypoints2 = Pathfinder.getRouteWaypoints(route2);

    const car2 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car2.setRouteWaypoints(waypoints2);
    car2.model.position.x = waypoints2[0].x;
    car2.model.position.z = waypoints2[0].z;
    car2.updateRouteLine();
    this.vehicles.push(car2);

    // Route
    const route3 = Pathfinder.findRoute(s1, b2);
    const waypoints3 = Pathfinder.getRouteWaypoints(route3);

    const car3 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car3.setRouteWaypoints(waypoints3);
    car3.model.position.x = waypoints3[0].x;
    car3.model.position.z = waypoints3[0].z;
    car3.updateRouteLine();
    this.vehicles.push(car3);

    // Add to scene
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
    this.scene.add(car2.model);
    this.scene.add(car2.routeLine);
    this.scene.add(car3.model);
    this.scene.add(car3.routeLine);
    roads.forEach((r) => {
      this.scene.add(r.model);
      r.lanes.forEach((l) => this.scene.add(l.line));
    });
    this.controls.target.z = -2;
  }

  private addCarWithRoute(fromRoad: Road, toRoad: Road, color?: THREE.Color) {
    const route = Pathfinder.findRoute(fromRoad, toRoad);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN), color);
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    car.updateRouteLine();

    this.vehicles.push(car);
  }

  private addRoad(name: RoadName, pos: THREE.Vector3, rot = 0) {
    const road = RoadFactory.createRoad(name, this.modelLoader.getModel(name));

    road.position.x = pos.x;
    road.position.y = pos.y;
    road.position.z = pos.z;

    road.rotation.y = rot;

    road.postTransform();

    return road;
  }
}
