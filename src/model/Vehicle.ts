import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public speed = 0.5;

  public routeWaypoints: THREE.Vector3[] = [];
  public nextWaypoint?: THREE.Vector3;

  public routeLine?: THREE.Line;
  public forward = new THREE.Vector3();

  constructor(public name: VehicleName, public model: THREE.Group) {
    model.getWorldDirection(this.forward);

    const mat = new THREE.LineBasicMaterial({ color: 'yellow' });
    const geom = new THREE.BufferGeometry();
    this.routeLine = new THREE.Line(geom, mat);
  }

  public get position() {
    return this.model.position;
  }

  public setRouteWaypoints(waypoints: THREE.Vector3[]) {
    this.routeWaypoints = waypoints;
    this.nextWaypoint = this.routeWaypoints[0];

    this.setRouteLine();
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

    // Update direction line
  }

  private driveRoute(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint)) {
      // Remove this waypoint
      // Note - this has last visited road id
      this.routeWaypoints.shift();
      this.setRouteLine();

      // Was that the last waypoint on this route?
      if (!this.routeWaypoints.length) {
        return;
      }

      // Target next waypoint in list
      this.nextWaypoint = this.routeWaypoints[0];
    }

    // Otherwise, keep moving towards next target
    const direction = this.nextWaypoint.clone().sub(this.position).normalize();
    const speed = deltaTime * this.speed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    const lookDir = this.nextWaypoint.clone();
    lookDir.y = this.position.y;
    this.model.lookAt(lookDir);

    this.model.getWorldDirection(this.forward);
    //console.log('car forward', this.forward);
  }
}
