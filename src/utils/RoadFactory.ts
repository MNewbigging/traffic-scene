import * as THREE from 'three';

import { Lane } from '../model/Lane';
import { Road } from '../model/Road';
import { RoadName } from './ModelLoader';

export class RoadFactory {
  public static createRoad(name: RoadName, model: THREE.Group) {
    const road = new Road(name, model);
    const box = new THREE.Box3().setFromObject(road.model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Create the ref points then lane lines for the road
    switch (name) {
      case RoadName.STRAIGHT:
        road.neighbours = [undefined, undefined];
        this.createStraightRoadEdgePoints(road, size);
        this.createStraightRoadLanes(road, size);
        break;
      case RoadName.BEND:
        this.createBendRoadLanes(road);
        break;
    }

    return road;
  }

  private static createStraightRoadEdgePoints(road: Road, size: THREE.Vector3) {
    // Two ref points at center on x and either edge
    const pos = road.model.position.clone();
    const halfDepth = size.z * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createStraightRoadLanes(road: Road, size: THREE.Vector3) {
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

    const laneOneGeom = new THREE.BufferGeometry().setFromPoints(laneOnePoints);
    const laneOneMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const laneOneLine = new THREE.Line(laneOneGeom, laneOneMat);
    //road.leftLane = laneOneLine;

    const laneOne = new Lane();
    laneOne.line = laneOneLine;
    road.lanes.push(laneOne);

    // Lane 2
    const laneTwoPoints = [
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z + 1),
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z),
      new THREE.Vector3(modelPos.x - laneCenter, modelPos.y, modelPos.z - 1),
    ];

    const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    const laneTwoMat = new THREE.LineBasicMaterial({ color: 'red' });
    const laneTwoLine = new THREE.Line(laneTwoGeom, laneTwoMat);
    //road.rightLane = laneTwo;

    const laneTwo = new Lane();
    laneTwo.line = laneTwoLine;
    road.lanes.push(laneTwo);
  }

  private static createBendRoadLanes(road: Road) {
    // Relative to model size
    const box = new THREE.Box3().setFromObject(road.model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const pos = road.model.position.clone();
    const halfWidth = size.x * 0.5;
    const laneCenter = halfWidth * 0.4;

    // Lane 1
    const laneOneStart = new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z + halfWidth);
    const laneOneEnd = new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z - laneCenter);

    const laneOneControlMod = halfWidth * 0.28;
    const laneOneControl = new THREE.Vector3(
      pos.x - laneOneControlMod,
      pos.y,
      pos.z - laneOneControlMod
    );

    const laneOneCurve = new THREE.QuadraticBezierCurve3(laneOneStart, laneOneControl, laneOneEnd);
    const laneOnePoints = laneOneCurve.getPoints(10);

    const laneOneGeom = new THREE.BufferGeometry().setFromPoints(laneOnePoints);
    const laneOneMat = new THREE.LineBasicMaterial({ color: 'red' });
    const laneOne = new THREE.Line(laneOneGeom, laneOneMat);
    road.leftLane = laneOne;

    // Lane 2
    const laneTwoStart = new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter);
    const laneTwoEnd = new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfWidth);

    const laneTwoControlMod = halfWidth * 0.4;
    const laneTwoControl = new THREE.Vector3(
      pos.x + laneTwoControlMod,
      pos.y,
      pos.z + laneTwoControlMod
    );

    const laneTwoCurve = new THREE.QuadraticBezierCurve3(laneTwoStart, laneTwoControl, laneTwoEnd);
    const laneTwoPoints = laneTwoCurve.getPoints(10);

    const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    const laneTwoMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const laneTwo = new THREE.Line(laneTwoGeom, laneTwoMat);
    road.rightLane = laneTwo;
  }
}
