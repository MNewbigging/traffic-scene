import * as THREE from 'three';
import { BufferGeometry } from 'three';

import { NumberUtils } from './NumberUtils';
import { Road } from '../model/Road';
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

  public static addTransforms(from: THREE.Object3D, to: THREE.Object3D) {
    const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
    axes.forEach((axis) => {
      to.position[axis] += from.position[axis];
      to.rotation[axis] += from.rotation[axis];
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
      points.push(worldPoint);
    }

    return points;
  }

  public static getLinePositions(line: THREE.Line) {
    const points: THREE.Vector3[] = [];

    const positions = line.geometry.getAttribute('position');
    const posCount = positions.count;
    for (let i = 0; i < posCount; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i);
      const worldPoint = line.localToWorld(point);
      points.push(worldPoint);
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

  public static getRandomStartingRoad(roads: Road[]) {
    // Cannot start on these roads
    const disallowedNames = [RoadName.ROUNDABOUT, RoadName.JUNCTION, RoadName.CROSSROAD];

    // Get all valid roads
    const validRoads = roads.filter((road) => !disallowedNames.includes(road.name));

    // Return a random one
    const rnd = NumberUtils.getRandomArrayIndex(validRoads.length);

    return validRoads[rnd];
  }
}
