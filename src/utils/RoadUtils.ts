import * as THREE from 'three';
import { BufferGeometry } from 'three';

import { RoadName } from './ModelLoader';

export class RoadUtils {
  public static copyTransforms(from: THREE.Object3D, to: THREE.Object3D) {
    const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
    axes.forEach((axis) => {
      to.position[axis] = from.position[axis];
      to.rotation[axis] = from.rotation[axis];
    });

    to.updateMatrixWorld();
  }

  public static getEdgePointPositions(edgePoints: THREE.Points) {
    const points: THREE.Vector3[] = [];

    const positions = edgePoints.geometry.getAttribute('position');
    const posCount = positions.count;
    for (let i = 0; i < posCount; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i);
      const worldPoint = edgePoints.localToWorld(point);
      points.push(point);
    }

    return points;
  }

  public static getClosestIndexFromArray(point: THREE.Vector3, array: THREE.Vector3[]): number {
    let closestDistance = Number.MAX_VALUE;
    let closest: number = undefined;

    array.forEach((item, index) => {
      // Calculate distance
      const distance = point.distanceTo(item);
      // Remember if it's smallest yet
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    return closest;
  }

  public static getCorrectLane(
    roadName: RoadName,
    travelDir: THREE.Vector3,
    roadForward: THREE.Vector3,
    leftLanePoints: THREE.Vector3[],
    rightLanePoints: THREE.Vector3[]
  ) {
    const dot = roadForward.dot(travelDir);

    switch (roadName) {
      case RoadName.STRAIGHT:
        return this.getStraightRoadLane(dot, leftLanePoints, rightLanePoints);
      case RoadName.BEND:
        return this.getBendRoadLane(dot, leftLanePoints, rightLanePoints);
    }
  }

  private static getStraightRoadLane(
    dot: number,
    leftLanePoints: THREE.Vector3[],
    rightLanePoints: THREE.Vector3[]
  ) {
    // If dot is 1, same direction as forward; use left lane
    if (dot === 1) {
      return leftLanePoints;
    }

    // If dot is -1, opposite directions; use right lane
    if (dot === -1) {
      return rightLanePoints;
    }

    // In case dot isn't exactly 1 or -1, return something!
    return leftLanePoints;
  }

  private static getBendRoadLane(
    dot: number,
    leftLanePoints: THREE.Vector3[],
    rightLanePoints: THREE.Vector3[]
  ) {
    // If dot is -1, use left lane (road faces bend entrance at 001, bending to right)
    if (dot === -1) {
      return leftLanePoints;
    }

    // Otherwise, return right lane
    return rightLanePoints;
  }

  // Copy this when adding more
  // private static getBendRoadLane(
  //   travelDir: THREE.Vector3,
  //   roadForward: THREE.Vector3,
  //   leftLanePoints: THREE.Vector3[],
  //   rightLanePoints: THREE.Vector3[]
  // ) {}
}
