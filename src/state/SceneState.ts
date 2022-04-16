import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Pathfinder } from '../utils/Pathfinder';
import { Road, RoadWaypoint } from '../model/Road';
import { Vehicle } from '../model/Vehicle';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  public scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  public roads: Road[] = [];
  public vehicles: Vehicle[] = [];
  private modelLoader = new ModelLoader();
  private onReady?: () => void;

  constructor(private canvasListener: CanvasListener) {}

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    // Work out which models we need to load for this scene
    // This is where proc gen comes in - hardcoded for now
    const modelNames = new ModelNames();
    modelNames.roads = [RoadName.END, RoadName.STRAIGHT];
    modelNames.vehicles = [VehicleName.SEDAN];

    this.modelLoader.loadModels(modelNames, () => this.buildScene());
  }

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    this.setupCamera();

    // Axes helper - The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const mid2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Road pieces are 2x2 on x/z, space apart evenly
    start.setPositionX(-2);
    // mid already at 0
    mid2.setPositionX(2);
    end.setPositionX(4);

    // Rotate start piece
    start.model.rotation.y = Math.PI;

    // Connect roads
    start.neighbours.push(mid);
    mid.neighbours.push(start);
    mid.neighbours.push(mid2);
    mid2.neighbours.push(mid);
    mid2.neighbours.push(end);
    end.neighbours.push(mid2);

    // Add to scene
    [start, mid, mid2, end].forEach((r) => {
      this.roads.push(r);
      this.scene.add(r.model);
      this.scene.add(r.node);
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    // Find route test
    const route = Pathfinder.findRoute(start, end);
    console.log('route', route);

    // Create the waypoints for this route
    const waypoints: RoadWaypoint[] = [];
    route.forEach((r) => {
      r.waypoints.forEach((rwp) => waypoints.push(rwp));
    });
    console.log('waypoints', waypoints);
    vehicle.setRouteWaypoints(waypoints);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);
    this.scene.add(vehicle.routeLine);

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

  public updateScene(deltaTime: number) {
    this.controls.target = this.vehicles[0].position;
    this.controls.update();

    // Move vehicles along their route
    this.vehicles.forEach((v) => v.update(deltaTime));
  }
}
