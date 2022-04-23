import * as THREE from 'three';

import { Lane } from './Lane';
import { NumberUtils } from '../utils/NumberUtils';
import { Road } from './Road';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public routeLine?: THREE.Line;
  private speed = 3;
  private route: Road[] = [];
  public currentRoad?: Road;
  private currentLane?: Lane;
  private routeWaypoints: THREE.Vector3[] = [];
  private nextWaypoint?: THREE.Vector3;
  private nextLookAt = new THREE.Quaternion();

  constructor(public name: VehicleName, public model: THREE.Group, color?: THREE.Color) {
    this.setColor(color);

    const mat = new THREE.LineBasicMaterial({ color });
    const geom = new THREE.BufferGeometry();
    this.routeLine = new THREE.Line(geom, mat);
  }

  public get position() {
    return this.model.position;
  }

  // Gives this vehicle a starting road to roam from
  public setRoam(road: Road) {
    // Set the road
    this.currentRoad = road;

    // Pick a random lane on this road
    const rnd = Math.floor(Math.random() * road.lanes.length);
    this.currentLane = road.lanes[rnd];

    // Get the waypoints for this lane
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Position vehicle at first waypoint
    this.position.x = this.routeWaypoints[0].x;
    this.position.z = this.routeWaypoints[0].z;

    // Face the second waypoint immediately
    this.model.lookAt(this.routeWaypoints[1]);

    // Since we're at the first waypoint, can target the next
    this.targetNextWaypoint();
  }

  // Give the vehicle a route to follow
  public setRoute(route: Road[]) {
    this.route = route;

    const first = route[0];
    const second = route[1];

    // Get the lane that goes from start to next
    const lane = first.getConnectingLane(first, second);

    // Assign road and lane
    this.currentRoad = first;
    this.currentLane = lane;

    // Get waypoints for this lane
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Snap to position of first route point, face second
    this.position.x = this.routeWaypoints[0].x;
    this.position.z = this.routeWaypoints[0].z;
    this.model.lookAt(this.routeWaypoints[1]);

    // Target the next
    this.targetNextWaypoint();
  }

  public update(deltaTime: number) {
    // Drive along the route
    this.drive(deltaTime);

    // Update route line
    this.updateRouteLine();
  }

  private setColor(color: THREE.Color) {
    const body = this.model.getObjectByName('Mesh_body_1');
    if (body && body instanceof THREE.Mesh) {
      body.material = new THREE.MeshBasicMaterial({ color });
    }
  }

  // Creates a new route line from route waypoints
  private setRouteLine() {
    const points = this.routeWaypoints.map((wp) => wp.clone());
    points.forEach((p) => (p.y += 0.3));
    const pos = this.position.clone();
    pos.y += 0.3;
    points.unshift(pos);

    this.routeLine.geometry.setFromPoints(points);
  }

  // Updates start of route line to follow current position
  private updateRouteLine() {
    const positions = this.routeLine.geometry.getAttribute('position');
    positions.setXYZ(0, this.position.x, this.position.y + 0.3, this.position.z);
    positions.needsUpdate = true;
  }

  // Upon reaching a waypoint, calls this to move to next
  private targetNextWaypoint() {
    // Have we reached the end now?
    if (this.routeWaypoints.length === 1) {
      this.onWaypointsEnd();
      //this.onRouteComplete?.(this);
      return;
    }

    // Remove the first waypoint (just reached it)
    this.routeWaypoints.shift();

    // Target the next
    this.nextWaypoint = this.routeWaypoints[0];

    // Save current facing direction
    const facing = this.model.rotation.clone();

    // Turn to look at next waypoint
    this.model.lookAt(this.nextWaypoint);

    // Save next waypoint facing direction
    this.nextLookAt = new THREE.Quaternion().copy(this.model.quaternion);

    // Rotate back to original facing direction
    this.model.rotation.x = facing.x;
    this.model.rotation.y = facing.y;
    this.model.rotation.z = facing.z;

    // Update route line to remove point just reached
    this.setRouteLine();
  }

  // When there are no more waypoints to follow
  private onWaypointsEnd() {
    // The route is finished
    this.routeWaypoints = [];

    // If the vehicle is following a set route, use the next road in the route
    if (this.route.length) {
      this.nextRouteRoad();
    } else {
      // Otherwise continue roaming - find the next road the current lane goes to
      this.nextRoamRoad();
    }
  }

  private nextRouteRoad() {
    // Current road is the fromRoad
    const fromRoad = this.currentRoad;

    // Road after next is toRoad
    const nextIdx = this.route.findIndex((r) => r.id === this.currentRoad.id) + 1;
    const toRoad = this.route[nextIdx + 1] ?? this.route[nextIdx];
    const nextRoad = this.route[nextIdx];

    // Get the lane on next road that connects fromRoad and toRoad
    const lane = nextRoad.getConnectingLane(fromRoad, toRoad);

    // Assign, get waypoints
    this.currentRoad = nextRoad;
    this.currentLane = lane;
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Lose the road we've just travelled
    this.route.shift();

    // If there is only one road left, can clear route as we have lane to it
    if (this.route.length === 1) {
      this.route = [];
    }

    // Target the next
    this.targetNextWaypoint();
  }

  private nextRoamRoad() {
    const toRoadIdx = this.currentLane?.toRoadIdx;
    const nextRoad = this.currentRoad?.neighbours[toRoadIdx];

    // Then find lanes that go from current road to the next
    const lanes = nextRoad.lanes.filter(
      (lane) => nextRoad.neighbours[lane.fromRoadIdx].id === this.currentRoad.id
    );

    // Pick a random lane
    const rnd = NumberUtils.getRandomArrayIndex(lanes.length);
    const nextLane = lanes[rnd];

    // Assign the next road and lane as current
    this.currentRoad = nextRoad;
    this.currentLane = nextLane;

    // Get the next lane's waypoints
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Target the next (the first will be the last of current lane)
    this.targetNextWaypoint();
  }

  private drive(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint)) {
      // Target the next waypoint
      this.targetNextWaypoint();
    }

    // Otherwise, keep moving towards next target
    const direction = this.nextWaypoint.clone().sub(this.position).normalize();
    const speed = deltaTime * this.speed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    // Rotate towards next target
    const rotateSpeed = speed * 1.5;
    this.model.quaternion.rotateTowards(this.nextLookAt, rotateSpeed);
  }
}
