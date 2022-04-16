import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { Road, RoadWaypoint } from './Road';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public speed = 0.5;

  public routeWaypoints: RoadWaypoint[] = [];
  public nextWaypoint?: RoadWaypoint;

  public routeLine?: THREE.Line;
  public forward = new THREE.Vector3();

  constructor(public name: VehicleName, public model: THREE.Group) {
    // TODO - this is hacky, fix some other way
    this.model.lookAt(1, 0, 0);
    model.getWorldDirection(this.forward);
    //console.log('model forward', this.forward);

    const mat = new THREE.LineBasicMaterial({ color: 'yellow' });
    const geom = new THREE.BufferGeometry();
    this.routeLine = new THREE.Line(geom, mat);
  }

  public get position() {
    return this.model.position;
  }

  public setRouteWaypoints(waypoints: RoadWaypoint[]) {
    this.routeWaypoints = waypoints;
    this.nextWaypoint = this.routeWaypoints[0];
    this.setRouteLine();
  }

  private setRouteLine() {
    const points = this.routeWaypoints.map((wp) => wp.point.clone());
    points.forEach((p) => (p.y += 0.3));
    const pos = this.position.clone();
    pos.y += 0.3;
    points.unshift(pos);

    this.routeLine.geometry.setFromPoints(points);
  }

  private updateRouteLine() {
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

  private driveRoute(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint.point)) {
      console.log('reached next waypoint', this.position);
      // Remove this waypoint
      // Note - this has last visited road id
      this.routeWaypoints.shift();
      this.setRouteLine();

      // Was that the last waypoint on this route?
      if (!this.routeWaypoints.length) {
        console.log('reached last waypoint');
        return;
      }

      // Target next waypoint in list
      this.nextWaypoint = this.routeWaypoints[0];
      console.log('moving to ', this.nextWaypoint);
    }

    // Otherwise, keep moving towards next target

    // Note - this slows down as it approaches the target
    // Direction from here to target
    const direction = this.nextWaypoint.point.clone().sub(this.position).normalize();
    const speed = deltaTime * this.speed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    // this.nextWaypointTime += deltaTime * this.speed;
    // this.position.lerp(this.nextWaypoint, this.nextWaypointTime);

    //console.log('pos', this.position);
  }
}
