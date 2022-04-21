import * as THREE from 'three';

import { Lane } from '../model/Lane';
import { Road } from '../model/Road';
import { RoadName } from './ModelLoader';

export class RoadFactory {
  private static firstLaneMat = new THREE.LineBasicMaterial({ color: 'blue' });
  private static secondLaneMat = new THREE.LineBasicMaterial({ color: 'red' });
  private static thirdLaneMat = new THREE.LineBasicMaterial({ color: 'yellow' });

  public static createRoad(name: RoadName, model: THREE.Group) {
    const road = new Road(name, model);

    // Perform initial setup of neighbours, edge points and lane lines
    switch (name) {
      case RoadName.STRAIGHT:
        road.neighbours = [undefined, undefined];
        this.createStraightRoadEdgePoints(road);
        this.createStraightRoadLanes(road);
        break;
      case RoadName.BEND:
        road.neighbours = [undefined, undefined];
        this.createBendRoadEdgePoints(road);
        this.createBendRoadLanes(road);
        break;
      case RoadName.JUNCTION:
        road.neighbours = [undefined, undefined, undefined];
        this.createJunctionEdgePoints(road);
        this.createJunctionLanes(road);
        break;
    }

    return road;
  }

  private static createStraightRoadEdgePoints(road: Road) {
    // Two ref points at center on x and either edge
    const pos = road.model.position.clone();
    const halfDepth = road.size.z * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createStraightRoadLanes(road: Road) {
    // Lane 1
    this.createStraightLane(road, this.firstLaneMat);

    // Lane 2
    this.createStraightLane(road, this.secondLaneMat, Math.PI);
  }

  private static createBendRoadEdgePoints(road: Road) {
    // Ref points face forward and to its left by 90 deg
    const pos = road.model.position.clone();

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + road.size.z * 0.5),
      new THREE.Vector3(pos.x + road.size.x * 0.5, pos.y, pos.z),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createBendRoadLanes(road: Road) {
    // Lane 1
    this.createWideCurveLine(road, this.secondLaneMat);

    // Lane 2
    // const laneTwoStart = new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter);
    // const laneTwoEnd = new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfWidth);

    // const laneTwoControlMod = halfWidth * 0.4;
    // const laneTwoControl = new THREE.Vector3(
    //   pos.x + laneTwoControlMod,
    //   pos.y,
    //   pos.z + laneTwoControlMod
    // );

    // const laneTwoCurve = new THREE.QuadraticBezierCurve3(laneTwoStart, laneTwoControl, laneTwoEnd);
    // const laneTwoPoints = laneTwoCurve.getPoints(16);

    // const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    // const laneTwoMat = new THREE.LineBasicMaterial({ color: 'blue' });
    // const laneTwoLine = new THREE.Line(laneTwoGeom, laneTwoMat);

    // const laneTwo = new Lane();
    // laneTwo.line = laneTwoLine;
    // road.lanes.push(laneTwo);

    this.createTightCurveLine(road, this.firstLaneMat);
  }

  private static createJunctionEdgePoints(road: Road) {
    // Two ref points at center on x and either edge, one on x edge center z
    const pos = road.model.position.clone();
    const halfDepth = road.size.z * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + road.size.x * 0.5, pos.y, pos.z),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createJunctionLanes(road: Road) {
    const leftLaneMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const rightLaneMat = new THREE.LineBasicMaterial({ color: 'red' });
    const thirdLaneMat = new THREE.LineBasicMaterial({ color: 'yellow' });

    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.01;
    const halfWidth = road.size.x * 0.5;
    const halfDepth = road.size.z * 0.5;
    const laneCenter = halfWidth * 0.4;
    // 6 lanes; two for each direction

    // Lane 1 - straight across the junction in line with default normal
    this.createStraightLane(road, this.firstLaneMat);

    // Lane 2 - left turn facing default normal
    const smallCurveMod = halfWidth * 0.35;
    // const laneTwoCurvePoints = [
    //   new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z - halfDepth),
    //   new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z - smallCurveMod),
    //   new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z - laneCenter),
    // ];
    // const laneTwoCurve = new THREE.QuadraticBezierCurve3(
    //   laneTwoCurvePoints[0],
    //   laneTwoCurvePoints[1],
    //   laneTwoCurvePoints[2]
    // );
    // const laneTwoPoints = laneTwoCurve.getPoints(12);
    // const laneTwoGeom = new THREE.BufferGeometry().setFromPoints(laneTwoPoints);
    // const laneTwoLine = new THREE.Line(laneTwoGeom, leftLaneMat);
    // const laneTwo = new Lane();
    // laneTwo.line = laneTwoLine;
    // road.lanes.push(laneTwo);

    this.createTightCurveLine(road, this.firstLaneMat, Math.PI / 2);

    // Lane 3 - straight across junction opposite default normal
    this.createStraightLane(road, this.secondLaneMat, Math.PI);

    // Lane 4 - turning right opposite default normal
    const bigCurveMod = halfWidth * 0.45;
    // const laneFourCurvePoints = [
    //   new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z + halfDepth),
    //   new THREE.Vector3(pos.x - bigCurveMod, pos.y, pos.z + smallCurveMod),
    //   new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z - bigCurveMod),
    //   new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z - laneCenter),
    // ];
    // const laneFourCurve = new THREE.CubicBezierCurve3(
    //   laneFourCurvePoints[0],
    //   laneFourCurvePoints[1],
    //   laneFourCurvePoints[2],
    //   laneFourCurvePoints[3]
    // );
    // const laneFourPoints = laneFourCurve.getPoints(16);
    // const laneFourGeom = new THREE.BufferGeometry().setFromPoints(laneFourPoints);
    // const laneFourLine = new THREE.Line(laneFourGeom, rightLaneMat);
    // const laneFour = new Lane();
    // laneFour.line = laneFourLine;
    // road.lanes.push(laneFour);
    this.createWideCurveLine(road, this.secondLaneMat);

    // Lane 5 - adjoining lane going left, towards default normal
    // const laneFiveCurvePoints = [
    //   new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
    //   new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z + smallCurveMod),
    //   new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfDepth),
    // ];
    // const laneFiveCurve = new THREE.QuadraticBezierCurve3(
    //   laneFiveCurvePoints[0],
    //   laneFiveCurvePoints[1],
    //   laneFiveCurvePoints[2]
    // );
    // const laneFivePoints = laneFiveCurve.getPoints(12);
    // const laneFiveGeom = new THREE.BufferGeometry().setFromPoints(laneFivePoints);
    // const laneFiveLine = new THREE.Line(laneFiveGeom, thirdLaneMat);
    // const laneFive = new Lane();
    // laneFive.line = laneFiveLine;
    // road.lanes.push(laneFive);
    this.createTightCurveLine(road, this.thirdLaneMat);

    // Lane 6 - adjoining lane going right, away from default normal
    // const laneSixCurvePoints = [
    //   new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
    //   new THREE.Vector3(pos.x + smallCurveMod, pos.y, pos.z + bigCurveMod),
    //   new THREE.Vector3(pos.x - bigCurveMod, pos.y, pos.z - smallCurveMod),
    //   new THREE.Vector3(pos.x - laneCenter, pos.y, pos.z - halfDepth),
    // ];
    // const laneSixCurve = new THREE.CubicBezierCurve3(
    //   laneSixCurvePoints[0],
    //   laneSixCurvePoints[1],
    //   laneSixCurvePoints[2],
    //   laneSixCurvePoints[3]
    // );
    // const laneSixPoints = laneSixCurve.getPoints(16);
    // const laneSixGeom = new THREE.BufferGeometry().setFromPoints(laneSixPoints);
    // const laneSixLine = new THREE.Line(laneSixGeom, thirdLaneMat);
    // const laneSix = new Lane();
    // laneSix.line = laneSixLine;
    // road.lanes.push(laneSix);
    this.createWideCurveLine(road, this.thirdLaneMat, Math.PI / 2);
  }

  private static createStraightLane(road: Road, material: THREE.LineBasicMaterial, rotation = 0) {
    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.001;
    const halfWidth = road.size.x * 0.5;
    const halfDepth = road.size.z * 0.5;
    const laneCenter = halfWidth * 0.4;

    const lanePoints = [
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfDepth),
    ];

    const laneGeom = new THREE.BufferGeometry().setFromPoints(lanePoints);
    const laneLine = new THREE.Line(laneGeom, material);

    laneLine.rotation.y = rotation;

    const lane = new Lane();
    lane.line = laneLine;
    road.lanes.push(lane);
  }

  private static createTightCurveLine(road: Road, material: THREE.LineBasicMaterial, rotation = 0) {
    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.001;
    const halfWidth = road.size.x * 0.5;
    const laneCenter = halfWidth * 0.4;

    const curveMod = halfWidth * 0.4;

    const laneCurvePoints = [
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
      new THREE.Vector3(pos.x + curveMod, pos.y, pos.z + curveMod),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfWidth),
    ];

    const laneCurve = new THREE.QuadraticBezierCurve3(
      laneCurvePoints[0],
      laneCurvePoints[1],
      laneCurvePoints[2]
    );

    const lanePoints = laneCurve.getPoints(12);
    const laneGeom = new THREE.BufferGeometry().setFromPoints(lanePoints);
    const laneLine = new THREE.Line(laneGeom, material);

    laneLine.rotation.y = rotation;

    const lane = new Lane();
    lane.line = laneLine;
    road.lanes.push(lane);
  }

  private static createWideCurveLine(road: Road, material: THREE.LineBasicMaterial, rotation = 0) {
    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.001;
    const halfWidth = road.size.x * 0.5;
    const halfDepth = road.size.z * 0.5;
    const laneCenter = halfWidth * 0.4;

    const smallCurveMod = halfWidth * 0.35;
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
    const laneFourLine = new THREE.Line(laneFourGeom, material);

    // Due to copying transforms later, this gets overriden
    // Shouldn't copy transforms, should add them for lines
    laneFourLine.rotation.y = rotation;
    laneFourLine.updateMatrixWorld();

    const laneFour = new Lane();
    laneFour.line = laneFourLine;
    road.lanes.push(laneFour);
  }
}
