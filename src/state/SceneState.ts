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
    //this.vehicles.forEach((v) => v.update(deltaTime));
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
    const b1 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));

    b1.rotation.y = Math.PI / 2;
    b1.generateLaneWaypoints();

    const forwardArrow = new THREE.ArrowHelper(b1.forward, b1.position, 1.5);
    const b1Forward = b1.forward.clone();
    console.log('bend faces', b1Forward);

    const posZ = new THREE.Vector3(0, 0, 1);
    const negZ = new THREE.Vector3(0, 0, -1);
    const posX = new THREE.Vector3(1, 0, 0);
    const negX = new THREE.Vector3(-1, 0, 0);
    [
      {
        name: 'posZ',
        face: posZ,
      },
      {
        name: 'negZ',
        face: negZ,
      },
      {
        name: 'posX',
        face: posX,
      },
      {
        name: 'negX',
        face: negX,
      },
    ].forEach((v) => {
      const dot = b1Forward.dot(v.face);
      console.log(`${v.name} dot: `, dot);
    });

    // Add to scene
    this.scene.add(b1.model);
    this.scene.add(b1.leftLane);
    this.scene.add(b1.rightLane);
    this.scene.add(forwardArrow);
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

    // Find a route from s1 to s3
    const route: Road[] = Pathfinder.findRoute(s3, s1);
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
