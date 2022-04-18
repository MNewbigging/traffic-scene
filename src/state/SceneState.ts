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

    // Axes helper - The X axis is red. The Y axis is green. The Z axis is blue.
    // const axesHelper = new THREE.AxesHelper(50);
    // this.scene.add(axesHelper);

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
    const s1 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );

    s1.setRotation('y', -(Math.PI / 2));

    const face = new THREE.Vector3();
    s1.model.getWorldDirection(face);
    const arrow = new THREE.ArrowHelper(face, s1.model.position, 1.5);
    this.scene.add(arrow);

    // this.scene.add(s1.topGroup);
    this.scene.add(s1.model);
    this.scene.add(s1.leftLane);
    this.scene.add(s1.rightLane);
  }

  private roadTestScene() {
    const s1 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const s2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const s3 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));

    s2.position.z = -2;
    s3.position.z = -4;

    s1.generateLaneLines();
    s2.generateLaneLines();
    s3.generateLaneLines();

    s1.neighbours.push(s2);
    s2.neighbours.push(s1);
    s2.neighbours.push(s3);
    s3.neighbours.push(s2);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    // Find the roads that make up the route
    const route: Road[] = Pathfinder.findRoute(s1, s3);
    // Find the waypoints for each road; requires picking the correct (left) lane
    this.getTravelDirection(route[0], route[1]);
    // get travel direction from route info
    // compare with road facing direction - dot product
    // if same dir, lane one, if opposite dirs, lane two

    // Show road lines
    const laneOneMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const laneTwoMat = new THREE.LineBasicMaterial({ color: 'yellow' });

    [s1, s2, s3].forEach((s) => {
      this.scene.add(s.model);

      // Show road lines
      const laneOneGeom = new THREE.BufferGeometry().setFromPoints(s.laneOnePoints);
      const laneOneLine = new THREE.Line(laneOneGeom, laneOneMat);
      this.scene.add(laneOneLine);

      const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(s.laneTwoPoints);
      const laneTwoLine = new THREE.Line(laneTwoGeom, laneTwoMat);
      this.scene.add(laneTwoLine);
    });
  }

  private basicTestScene() {
    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const mid2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Road pieces are 2x2 on x/z, space apart evenly
    start.position.x = -2;
    // mid already at 0
    mid2.position.x = 2;
    end.position.x = 4;

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
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    // Find route test
    const route = Pathfinder.findRoute(start, end);

    // Create the waypoints for this route
    const waypoints: RoadWaypoint[] = [];
    route.forEach((r) => {
      r.waypoints.forEach((rwp) => waypoints.push(rwp));
    });
    vehicle.setRouteWaypoints(waypoints);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);
    this.scene.add(vehicle.routeLine);
  }

  private bendTestScene() {
    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const mid2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const bend = new Road(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const leg = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Create an L shape
    start.position.x = 0;
    mid.position.x = 2;
    mid2.position.x = 4;
    bend.position.x = 6;
    bend.rotation.y = Math.PI;
    leg.position.x = 6;
    leg.position.z = 2;
    leg.rotation.y = Math.PI / 2;
    end.position.x = 6;
    end.position.z = 4;
    end.rotation.y = -Math.PI / 2;

    // Rotate start piece
    start.model.rotation.y = Math.PI;

    // Connect roads
    start.neighbours.push(mid);
    mid.neighbours.push(start);
    mid.neighbours.push(mid2);
    mid2.neighbours.push(mid);
    mid2.neighbours.push(bend);
    bend.neighbours.push(mid2);
    bend.neighbours.push(leg);
    leg.neighbours.push(bend);
    leg.neighbours.push(end);
    end.neighbours.push(leg);

    // Add to scene
    [start, mid, mid2, end, bend, leg].forEach((r) => {
      r.updateWaypoints(); // do this after moving them
      this.roads.push(r);
      this.scene.add(r.model);
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    // Find route test
    const route = Pathfinder.findRoute(start, end);

    // Create the waypoints for this route
    const waypoints: RoadWaypoint[] = [];
    route.forEach((r) => {
      r.waypoints.forEach((rwp) => waypoints.push(rwp));
    });
    vehicle.setRouteWaypoints(waypoints);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);
    this.scene.add(vehicle.routeLine);

    // TEMP - focus on bend
    this.controls.target = bend.position;
    this.scene.add(vehicle.dirArrow);
  }

  // First two roads in a route
  private getTravelDirection(firstRoad: Road, secondRoad: Road) {
    const direction = secondRoad.position.clone().sub(firstRoad.position).normalize();
    console.log('travel direction', direction);
    return direction;
  }
}
