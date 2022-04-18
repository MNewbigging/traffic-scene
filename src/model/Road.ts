import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { RoadName } from '../utils/ModelLoader';

export interface RoadWaypoint {
  roadId: string;
  point: THREE.Vector3;
}

export class Road {
  public id = NumberUtils.createId();
  public neighbours: Road[] = [];
  public speedLimit = 1;
  // 'left' is according to the default forward direction (0, 0, 1)
  public leftLanePoints: THREE.Vector3[] = [];
  public rightLanePoints: THREE.Vector3[] = [];
  public leftLane: THREE.Line;
  public rightLane: THREE.Line;

  private forward = new THREE.Vector3(0, 0, 1);

  constructor(public name: RoadName, public model: THREE.Group) {}

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get rotation(): THREE.Euler {
    return this.model.rotation;
  }

  // TODO - one function to set multiple axes so we don't update lane points unnecessarily
  public setPosition(axis: 'x' | 'y' | 'z', value: number) {
    this.model.position[axis] = value;
    this.leftLane.position[axis] = value;
    this.rightLane.position[axis] = value;

    this.postTransform();
  }

  public setRotation(axis: 'x' | 'y' | 'z', value: number) {
    this.model.rotation[axis] = value;
    this.leftLane.rotation[axis] = value;
    this.rightLane.rotation[axis] = value;

    this.postTransform();
  }

  /**
   * Given the vehicle's travel direction, determine which lane to use and return its waypoints.
   * @param travelDir normalised direction of travel of vehicle
   */
  public getLaneWaypoints(travelDir: THREE.Vector3) {
    // TODO - this will likely be different for various road types (like bends)
    const dot = this.forward.dot(travelDir);
    // If dot is 1, same direction as forward; use left lane
    if (dot === 1) {
      return this.leftLanePoints;
    }

    // If dot is -1, opposite directions; use right lane
    if (dot === -1) {
      return this.rightLanePoints;
    }

    // Otherwise, better choose something!
    return this.leftLanePoints;
  }

  // Following any transform updates
  public postTransform() {
    // Update matrices
    this.model.updateMatrixWorld();
    this.leftLane.updateMatrixWorld();
    this.rightLane.updateMatrixWorld();

    // Update facing direction
    this.model.getWorldDirection(this.forward);

    // Update lane points
    this.updateLaneWaypoints();
  }

  // Happens after a transform; caches new lane points to avoid costly lookups at runtime
  private updateLaneWaypoints() {
    // Left lane
    const leftPositions = this.leftLane.geometry.getAttribute('position');
    this.leftLanePoints = [];

    for (let i = 0; i < leftPositions.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(leftPositions, i);
      const worldPoint = this.leftLane.localToWorld(point);
      this.leftLanePoints.push(worldPoint);
    }

    // Right lane
    const rightPositions = this.rightLane.geometry.getAttribute('position');
    this.rightLanePoints = [];

    for (let i = 0; i < leftPositions.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(rightPositions, i);
      const worldPoint = this.leftLane.localToWorld(point);
      this.rightLanePoints.push(worldPoint);
    }
  }
}
