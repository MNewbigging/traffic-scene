import * as THREE from 'three';

import { Lane } from '../model/Lane';
import { Road } from '../model/Road';
import { RoadName } from './ModelLoader';

export class RoadFactory {
  private static firstLaneMat = new THREE.LineBasicMaterial({ color: 'blue' });
  private static secondLaneMat = new THREE.LineBasicMaterial({ color: 'red' });
  private static thirdLaneMat = new THREE.LineBasicMaterial({ color: 'yellow' });
  private static fourthLaneMat = new THREE.LineBasicMaterial({ color: 'green' });

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
      case RoadName.CROSSROAD:
        road.neighbours = [undefined, undefined, undefined, undefined];
        this.createCrossroadEdgePoints(road);
        this.createCrossroadLanes(road);
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
    this.createTightCurveLine(road, this.firstLaneMat);
  }

  private static createJunctionEdgePoints(road: Road) {
    // Two ref points at center on x and either edge, one on x edge center z
    const pos = road.position.clone();
    const halfWidth = road.size.x * 0.5;
    const halfDepth = road.size.z * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z),
    ];

    const edgeGeom = new THREE.BufferGeometry().setFromPoints(points);
    const edgeMat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(edgeGeom, edgeMat);

    road.edgePoints = edgePoints;
  }

  private static createJunctionLanes(road: Road) {
    // Lane 1 - straight across the junction in line with default normal
    this.createStraightLane(road, this.firstLaneMat);

    // Lane 2 - left turn facing default normal
    this.createTightCurveLine(road, this.firstLaneMat, Math.PI / 2);

    // Lane 3 - straight across junction opposite default normal
    this.createStraightLane(road, this.secondLaneMat, Math.PI);

    // Lane 4 - turning right opposite default normal
    this.createWideCurveLine(road, this.secondLaneMat);

    // Lane 5 - adjoining lane going left, towards default normal
    this.createTightCurveLine(road, this.thirdLaneMat);

    // Lane 6 - adjoining lane going right, away from default normal
    this.createWideCurveLine(road, this.thirdLaneMat, Math.PI / 2);
  }

  private static createCrossroadEdgePoints(road: Road) {
    const pos = road.position.clone();
    const halfDepth = road.size.z * 0.5;
    const halfWidth = road.size.x * 0.5;

    const points = [
      new THREE.Vector3(pos.x, pos.y, pos.z + halfDepth),
      new THREE.Vector3(pos.x - halfWidth, pos.y, pos.z),
      new THREE.Vector3(pos.x, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z),
    ];

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    const edgePoints = new THREE.Points(geom, mat);

    road.edgePoints = edgePoints;
  }

  private static createCrossroadLanes(road: Road) {
    // Lane 1 - straight over towards z
    this.createStraightLane(road, this.firstLaneMat);

    // Lane 2 - left turn facing z to facing x
    this.createTightCurveLine(road, this.firstLaneMat, Math.PI / 2);

    // Lane 3 - right turn from z to -x
    this.createWideCurveLine(road, this.firstLaneMat, Math.PI);

    // Lane 3 - straight over towards -z
    this.createStraightLane(road, this.secondLaneMat, Math.PI);

    // Lane 4 - left turn from -z to -x
    this.createTightCurveLine(road, this.secondLaneMat, -Math.PI / 2);

    // Lane 6 - right turn from -z to x
    this.createWideCurveLine(road, this.secondLaneMat);

    // Lane 7 - straight over towards -x
    this.createStraightLane(road, this.thirdLaneMat, -Math.PI / 2);

    // Lane 8 - left turn, -x to z
    this.createTightCurveLine(road, this.thirdLaneMat);

    // Lane 9 - right turn, -x to -z
    this.createWideCurveLine(road, this.thirdLaneMat, Math.PI / 2);

    // Lane 10 - straight over towards x
    this.createStraightLane(road, this.fourthLaneMat, Math.PI / 2);

    // Lane 11 - left turn, x to -z
    this.createTightCurveLine(road, this.fourthLaneMat, Math.PI);

    // Lane 12 - right turn, x to z
    this.createWideCurveLine(road, this.fourthLaneMat, -Math.PI / 2);
  }

  private static createStraightLane(road: Road, material: THREE.LineBasicMaterial, rotation = 0) {
    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.001;
    const halfWidth = road.size.x * 0.5;
    const halfDepth = road.size.z * 0.5;
    const laneCenter = halfWidth * 0.4;

    // Points along line
    const points = [
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z - halfDepth),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfDepth),
    ];

    // Line object
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, material);

    // Use given rotation
    line.rotation.y = rotation;

    // Create the lane object, set line and add to road
    const lane = new Lane();
    lane.line = line;
    road.lanes.push(lane);
  }

  private static createTightCurveLine(road: Road, material: THREE.LineBasicMaterial, rotation = 0) {
    // Relative to model size
    const pos = road.model.position.clone();
    pos.y += 0.001;
    const halfWidth = road.size.x * 0.5;
    const laneCenter = halfWidth * 0.4;

    // Start, control, end points for curve
    const curveMod = halfWidth * 0.4;
    const curvePoints = [
      new THREE.Vector3(pos.x + halfWidth, pos.y, pos.z + laneCenter),
      new THREE.Vector3(pos.x + curveMod, pos.y, pos.z + curveMod),
      new THREE.Vector3(pos.x + laneCenter, pos.y, pos.z + halfWidth),
    ];

    // Create curve object
    const laneCurve = new THREE.QuadraticBezierCurve3(
      curvePoints[0],
      curvePoints[1],
      curvePoints[2]
    );

    // Get n points along line for object
    const linePoints = laneCurve.getPoints(12);
    const geom = new THREE.BufferGeometry().setFromPoints(linePoints);
    const line = new THREE.Line(geom, material);

    // Use given rotation
    line.rotation.y = rotation;

    // Create lane, add line and add to road
    const lane = new Lane();
    lane.line = line;
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

    laneFourLine.rotation.y = rotation;

    const laneFour = new Lane();
    laneFour.line = laneFourLine;
    road.lanes.push(laneFour);
  }
}
