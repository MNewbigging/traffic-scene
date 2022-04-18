import * as THREE from 'three';

import { Road } from '../model/Road';
import { RoadName } from './ModelLoader';

export class RoadFactory {
  public static createRoad(name: RoadName, model: THREE.Group) {
    const road = new Road(name, model);

    // Create the lane lines
    switch (name) {
      case RoadName.STRAIGHT:
        this.createStraightRoadLanes(road);
        break;
    }

    return road;
  }

  private static createStraightRoadLanes(road: Road) {
    // Relative to model size to allow for scaling
    const box = new THREE.Box3().setFromObject(road.model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const halfWidth = size.x * 0.5;
    const laneCenter = halfWidth * 0.4; // Pavement 10% of a half

    // Straight roads face (0, 0, 1) by default
    const modelPos = road.model.position.clone();

    // Lane 1
    const laneOnePoints = [
      new THREE.Vector3(modelPos.x + laneCenter, modelPos.y, modelPos.z - 1),
      new THREE.Vector3(modelPos.x + laneCenter, modelPos.y, modelPos.z),
      new THREE.Vector3(modelPos.x + laneCenter, modelPos.y, modelPos.z + 1),
    ];

    // Lane 2
    const laneTwoPoints = [
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z - 1),
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z),
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z + 1),
    ];

    const laneOneGeom = new THREE.BufferGeometry().setFromPoints(laneOnePoints);
    const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);

    const laneOneMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const laneTwoMat = new THREE.LineBasicMaterial({ color: 'red' });

    const laneOne = new THREE.Line(laneOneGeom, laneOneMat);
    const laneTwo = new THREE.Line(laneTwoGeom, laneTwoMat);

    road.leftLane = laneOne;
    road.rightLane = laneTwo;
  }
}
