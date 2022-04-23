import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { NumberUtils } from '../utils/NumberUtils';
import { Pathfinder } from '../utils/Pathfinder';
import { Road } from '../model/Road';
import { RoadFactory } from '../utils/RoadFactory';
import { RoadUtils } from '../utils/RoadUtils';
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
    this.controls.update();
    //this.controls.target = this.vehicles[0].position;

    // Move vehicles along their route
    this.vehicles.forEach((v) => v.update(deltaTime));
  }

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    this.setupCamera();

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

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
    const b4 = this.addRoad(RoadName.BEND, new THREE.Vector3(6, 0, 0), -Math.PI / 2);
    const s12 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(6, 0, 2));
    const b5 = this.addRoad(RoadName.BEND, new THREE.Vector3(6, 0, 4), Math.PI);
    const b6 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, 4));
    const b7 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, 6), Math.PI);
    const s13 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, 6), Math.PI / 2);

    [
      r1,
      s1,
      b2,
      s3,
      s4,
      j1,
      s5,
      s6,
      b1,
      s7,
      j2,
      s8,
      s9,
      b3,
      s10,
      s11,
      b4,
      s12,
      b5,
      b6,
      b7,
      s13,
    ].forEach((r) => this.roads.push(r));

    // Connect all roads
    // Roundabout
    r1.connectRoads([s1, b2, s3, s4]);
    // route towards z, bends back up towards -z
    s1.connectRoads([r1, j1]);
    j1.connectRoads([s1, s5, s13]);
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
    s4.connectRoads([r1, b4]);
    b4.connectRoads([s4, s12]);
    s12.connectRoads([b4, b5]);
    b5.connectRoads([s12, b6]);
    b6.connectRoads([b5, b7]);
    b7.connectRoads([b6, s13]);
    s13.connectRoads([b7, j1]);

    // Route
    this.addCarWithRoute(s1, b2, new THREE.Color('#2354a1'));
    this.addCar(new THREE.Color('red'));
    this.addCarWithRoute(s5, s7, new THREE.Color('green'));
    this.addCarWithRoute(b5, s4, new THREE.Color('yellow'));
    this.addCar(new THREE.Color('white'));

    this.vehicles.forEach((v) => {
      this.scene.add(v.model);
      this.scene.add(v.routeLine);
    });

    this.roads.forEach((r) => {
      this.scene.add(r.model);
    });
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

  private addCar(color?: THREE.Color) {
    // Create the car
    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN), color);
    this.vehicles.push(car);

    // Pick a random road to start on
    let road = RoadUtils.getRandomStartingRoad(this.roads);

    // While a vehicle is on that starting road, pick another
    let vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    while (vehicleOnRoad) {
      road = RoadUtils.getRandomStartingRoad(this.roads);
      vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    }

    // Assign to car to start roaming
    car.setRoam(road);
  }

  private addCarWithRoute(fromRoad: Road, toRoad: Road, color?: THREE.Color) {
    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN), color);
    this.vehicles.push(car);

    // Get the route, position car at start of it
    const route = Pathfinder.findRoute(fromRoad, toRoad);
    car.setRoute(route);
  }
}
