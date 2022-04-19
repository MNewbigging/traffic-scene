import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { RoadName } from '../utils/ModelLoader';
import { RoadUtils } from '../utils/RoadUtils';

export class Road {
  public id = NumberUtils.createId();
  public neighbours: Road[] = [];
  public speedLimit = 1;
  // 'left' is according to the default forward direction (0, 0, 1)
  public leftLanePoints: THREE.Vector3[] = [];
  public rightLanePoints: THREE.Vector3[] = [];
  public leftLane: THREE.Line;
  public rightLane: THREE.Line;
  public forward = new THREE.Vector3(0, 0, 1);

  constructor(public name: RoadName, public model: THREE.Group) {
    model.getWorldDirection(this.forward);
  }

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get rotation(): THREE.Euler {
    return this.model.rotation;
  }

  /**
   * Given the vehicle's travel direction, determine which lane to use and return its waypoints.
   * @param travelDir normalised direction of travel of vehicle
   */
  public getLaneWaypoints(travelDir: THREE.Vector3) {
    // TODO - this will likely be different for various road types (like bends)
    // const dot = this.forward.dot(travelDir);
    // // If dot is 1, same direction as forward; use left lane
    // if (dot === 1) {
    //   return this.leftLanePoints;
    // }

    // // If dot is -1, opposite directions; use right lane
    // if (dot === -1) {
    //   return this.rightLanePoints;
    // }

    // // Otherwise, better choose something!
    // return this.leftLanePoints;

    return RoadUtils.getCorrectLane(
      this.name,
      travelDir,
      this.forward,
      this.leftLanePoints,
      this.rightLanePoints
    );
  }

  public generateLaneWaypoints() {
    // Update the lane lines as per model
    [this.leftLane, this.rightLane].forEach((lane) => {
      const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
      axes.forEach((axis) => {
        lane.position[axis] = this.model.position[axis];
        lane.rotation[axis] = this.model.rotation[axis];
      });
    });
    // Update lane matrices after transforms
    this.leftLane.updateMatrixWorld();
    this.rightLane.updateMatrixWorld();

    // Update facing direction
    this.model.updateMatrixWorld();
    this.model.getWorldDirection(this.forward);

    // Update lane points
    this.updateLaneWaypoints();
  }

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
