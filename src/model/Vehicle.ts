import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { Road } from './Road';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public speed = 0.2;
  public routeWaypoints: THREE.Vector3[] = [];
  public nextWaypoint?: THREE.Vector3;
  public nextWaypointTime = 0;
  public routeLine?: THREE.Line;
  public forward = new THREE.Vector3();

  constructor(public name: VehicleName, public model: THREE.Group) {
    // TODO - this is hacky, fix some other way
    this.model.lookAt(1, 0, 0);
    model.getWorldDirection(this.forward);
    console.log('model forward', this.forward);
  }

  public get position() {
    return this.model.position;
  }

  public setRouteWaypoints(waypoints: THREE.Vector3[]) {
    // Adjust the height of the waypoints according to height of this car
    this.routeWaypoints = waypoints;
    //this.routeWaypoints.forEach((wp) => (wp.y += 0.2));
    this.nextWaypoint = this.routeWaypoints[0];
    console.log('first waypoint is ', this.nextWaypoint);
    console.log('start pos is', this.position);
    this.createRouteLine();
  }

  private createRouteLine() {
    const mat = new THREE.LineBasicMaterial({ color: 'yellow' });
    const geom = new THREE.BufferGeometry().setFromPoints(this.routeWaypoints);
    this.routeLine = new THREE.Line(geom, mat);
  }

  public update(deltaTime: number) {
    // Drive along the route
    this.driveRoute(deltaTime);
  }

  private driveRoute(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint)) {
      console.log('reached next waypoint', this.position);
      // Remove this waypoint
      this.routeWaypoints.shift();
      this.nextWaypointTime = 0;

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
    const direction = this.nextWaypoint.clone().sub(this.position).normalize();
    const speed = deltaTime * this.speed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    // this.nextWaypointTime += deltaTime * this.speed;
    // this.position.lerp(this.nextWaypoint, this.nextWaypointTime);

    //console.log('pos', this.position);
  }
}
