import * as THREE from 'three';

import { RoadName } from './ModelLoader';

export class RoadUtils {
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
