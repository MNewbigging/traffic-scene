import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public speed = 0.5;
  public routeWaypoints: THREE.Vector3[] = [];
  public nextWaypoint?: THREE.Vector3;
  public routeLine?: THREE.Line;
  public lastRoadId = ''; // slight hack to get final road when route is done, to change later
  private onRouteComplete?: (car: Vehicle) => void;
  private nextLookAt = new THREE.Quaternion();
  private nextWaypointDistance = 0;
  private lookAtIncrement = 0;

  constructor(public name: VehicleName, public model: THREE.Group, color?: THREE.Color) {
    this.setColor(color);

    const mat = new THREE.LineBasicMaterial({ color });
    const geom = new THREE.BufferGeometry();
    this.routeLine = new THREE.Line(geom, mat);
  }

  public get position() {
    return this.model.position;
  }

  public setRoute(
    waypoints: THREE.Vector3[],
    lastRoadId: string,
    onComplete?: (car: Vehicle) => void
  ) {
    // Save callback and info for when route is finished
    this.lastRoadId = lastRoadId;
    this.onRouteComplete = onComplete;

    // Save route
    this.routeWaypoints = waypoints;

    // Always start the route at first waypoint
    this.position.x = waypoints[0].x;
    this.position.z = waypoints[0].z;

    // Can now target the next waypoint since we're at the first already
    this.targetNextWaypoint();

    // Face next waypoint immediately
    this.model.lookAt(this.nextWaypoint);

    this.setRouteLine();
    this.updateRouteLine();
  }

  private setColor(color: THREE.Color) {
    const body = this.model.getObjectByName('Mesh_body_1');
    if (body && body instanceof THREE.Mesh) {
      body.material = new THREE.MeshBasicMaterial({ color });
    }
  }

  private setRouteLine() {
    const points = this.routeWaypoints.map((wp) => wp.clone());
    points.forEach((p) => (p.y += 0.3));
    const pos = this.position.clone();
    pos.y += 0.3;
    points.unshift(pos);

    this.routeLine.geometry.setFromPoints(points);
  }

  public updateRouteLine() {
    const positions = this.routeLine.geometry.getAttribute('position');
    positions.setXYZ(0, this.position.x, this.position.y + 0.3, this.position.z);
    positions.needsUpdate = true;
  }

  public update(deltaTime: number) {
    // Drive along the route
    this.driveRoute(deltaTime);

    // Update route line
    this.updateRouteLine();
  }

  private targetNextWaypoint() {
    this.routeWaypoints.shift();

    // Have we reached the end now?
    if (!this.routeWaypoints.length) {
      this.onRouteComplete?.(this);
      return;
    }

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

    // Update route line
    this.setRouteLine();
  }

  private driveRoute(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint)) {
      // Target the next waypoint
      this.targetNextWaypoint();

      // Target next waypoint in list
      // this.nextWaypoint = this.routeWaypoints[0];

      // // Look ahead of this target
      // const nextLookTarget =
      //   // this.routeWaypoints[4] ??
      //   // this.routeWaypoints[3] ??
      //   //this.routeWaypoints[2] ??
      //   //this.routeWaypoints[1] ??
      //   this.routeWaypoints[0];

      // // Save current facing direction
      // const facing = this.model.rotation.clone();

      // // Turn to look at next waypoint
      // this.model.lookAt(nextLookTarget);

      // // Save next waypoint facing direction
      // this.nextLookAt = new THREE.Quaternion().copy(this.model.quaternion);

      // // Rotate back to original facing direction
      // this.model.rotation.x = facing.x;
      // this.model.rotation.y = facing.y;
      // this.model.rotation.z = facing.z;

      // const lookDir = this.nextWaypoint.clone();
      // lookDir.y = this.position.y;
      // this.model.lookAt(lookDir);
    }

    // Otherwise, keep moving towards next target
    const direction = this.nextWaypoint.clone().sub(this.position).normalize();
    const speed = deltaTime * this.speed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    // Use difference as a measure of slerpiness
    const rotateSpeed = speed * 1.5;
    this.model.quaternion.rotateTowards(this.nextLookAt, rotateSpeed);
  }
}
