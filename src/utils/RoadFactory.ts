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

    // Perform initial setup of neighbours, edge points and lane lines
    switch (name) {
      case RoadName.STRAIGHT:
        road.neighbours = [undefined, undefined];
        this.createStraightRoadEdgePoints(road, size);
        this.createStraightRoadLanes(road, size);
        break;
      case RoadName.BEND:
        road.neighbours = [undefined, undefined];
        this.createBendRoadEdgePoints(road, size);
        this.createBendRoadLanes(road, size);
        break;
      case RoadName.JUNCTION:
        road.neighbours = [undefined, undefined, undefined];
        this.createJunctionEdgePoints(road, size);
        this.createJunctionLanes(road, size);
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

  private static createBendRoadEdgePoints(road: Road, size: THREE.Vector3) {
    // Ref points face forward and to its left by 90 deg
    const pos = road.model.position.clone();

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + size.z * 0.5),
      new THREE.Vector3(pos.x + size.x * 0.5, pos.y, pos.z),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createBendRoadLanes(road: Road, size: THREE.Vector3) {
    // Relative to model size
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
    const laneOnePoints = laneOneCurve.getPoints(16);

    const laneOneGeom = new THREE.BufferGeometry().setFromPoints(laneOnePoints);
    const laneOneMat = new THREE.LineBasicMaterial({ color: 'red' });
    const laneOneLine = new THREE.Line(laneOneGeom, laneOneMat);

    const laneOne = new Lane();
    laneOne.line = laneOneLine;
    road.lanes.push(laneOne);

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
    const laneTwoPoints = laneTwoCurve.getPoints(16);

    const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    const laneTwoMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const laneTwoLine = new THREE.Line(laneTwoGeom, laneTwoMat);

    const laneTwo = new Lane();
    laneTwo.line = laneTwoLine;
    road.lanes.push(laneTwo);
  }

  private static createJunctionEdgePoints(road: Road, size: THREE.Vector3) {
    // Two ref points at center on x and either edge, one on x edge center z
    const pos = road.model.position.clone();
    const halfDepth = size.z * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + size.x * 0.5, pos.y, pos.z),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createJunctionLanes(road: Road, size: THREE.Vector3) {
    const leftLaneMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const rightLaneMat = new THREE.LineBasicMaterial({ color: 'red' });
    const thirdLaneMat = new THREE.LineBasicMaterial({ color: 'yellow' });

    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.01;
    const halfWidth = size.x * 0.5;
    const halfDepth = size.z * 0.5;
    const laneCenter = halfWidth * 0.4;
    // 6 lanes; two for each direction

    // Lane 1 - straight across the junction in line with default normal
    const laneOnePoints = [
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfDepth),
    ];
    const laneOneGeom = new THREE.BufferGeometry().setFromPoints(laneOnePoints);
    const laneOneLine = new THREE.Line(laneOneGeom, leftLaneMat);
    const laneOne = new Lane();
    laneOne.line = laneOneLine;
    road.lanes.push(laneOne);

    // Lane 2 - left turn facing default normal
    const smallCurveMod = halfWidth * 0.35;
    const laneTwoCurvePoints = [
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z - smallCurveMod),
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z - laneCenter),
    ];
    const laneTwoCurve = new THREE.QuadraticBezierCurve3(
      laneTwoCurvePoints[0],
      laneTwoCurvePoints[1],
      laneTwoCurvePoints[2]
    );
    const laneTwoPoints = laneTwoCurve.getPoints(12);
    const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    const laneTwoLine = new THREE.Line(laneTwoGeom, leftLaneMat);
    const laneTwo = new Lane();
    laneTwo.line = laneTwoLine;
    road.lanes.push(laneTwo);

    // Lane 3 - straight across junction opposite default normal
    const laneThreePoints = [
      new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z),
      new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z - halfDepth),
    ];
    const laneThreeGeom = new THREE.BufferGeometry().setFromPoints(laneThreePoints);
    const laneThreeLine = new THREE.Line(laneThreeGeom, rightLaneMat);
    const laneThree = new Lane();
    laneThree.line = laneThreeLine;
    road.lanes.push(laneThree);

    // Lane 4 - turning right opposite default normal
    const bigCurveMod = halfWidth * 0.45;
    const laneFourCurvePoints = [
      new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x - bigCurveMod, pos.y, pos.z + smallCurveMod),
      new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z - bigCurveMod),
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z - laneCenter),
    ];
    const laneFourCurve = new THREE.CubicBezierCurve3(
      laneFourCurvePoints[0],
      laneFourCurvePoints[1],
      laneFourCurvePoints[2],
      laneFourCurvePoints[3]
    );
    const laneFourPoints = laneFourCurve.getPoints(16);
    const laneFourGeom = new THREE.BufferGeometry().setFromPoints(laneFourPoints);
    const laneFourLine = new THREE.Line(laneFourGeom, rightLaneMat);
    const laneFour = new Lane();
    laneFour.line = laneFourLine;
    road.lanes.push(laneFour);

    // Lane 5 - adjoining lane going left, towards default normal
    const laneFiveCurvePoints = [
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
      new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z + smallCurveMod),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfDepth),
    ];
    const laneFiveCurve = new THREE.QuadraticBezierCurve3(
      laneFiveCurvePoints[0],
      laneFiveCurvePoints[1],
      laneFiveCurvePoints[2]
    );
    const laneFivePoints = laneFiveCurve.getPoints(12);
    const laneFiveGeom = new THREE.BufferGeometry().setFromPoints(laneFivePoints);
    const laneFiveLine = new THREE.Line(laneFiveGeom, thirdLaneMat);
    const laneFive = new Lane();
    laneFive.line = laneFiveLine;
    road.lanes.push(laneFive);

    // Lane 6 - adjoining lane going right, away from default normal
    const laneSixCurvePoints = [
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
      new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z + bigCurveMod),
      new THREE.Vector3(pos.x - bigCurveMod, pos.y, pos.z - smallCurveMod),
      new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z - halfDepth),
    ];
    const laneSixCurve = new THREE.CubicBezierCurve3(
      laneSixCurvePoints[0],
      laneSixCurvePoints[1],
      laneSixCurvePoints[2],
      laneSixCurvePoints[3]
    );
    const laneSixPoints = laneSixCurve.getPoints(16);
    const laneSixGeom = new THREE.BufferGeometry().setFromPoints(laneSixPoints);
    const laneSixLine = new THREE.Line(laneSixGeom, thirdLaneMat);
    const laneSix = new Lane();
    laneSix.line = laneSixLine;
    road.lanes.push(laneSix);
  }
}
