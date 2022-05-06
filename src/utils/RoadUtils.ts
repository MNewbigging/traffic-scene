import * as THREE from 'three';

import { NumberUtils } from './NumberUtils';
import { Road } from '../model/Road';
import { RoadName } from '../loaders/ModelLoader';
import { Vehicle } from '../model/Vehicle';

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

  public static getRandomStartingRoad(roads: Road[]) {
    // Cannot start on these roads
    const disallowedNames = [RoadName.ROUNDABOUT, RoadName.JUNCTION, RoadName.CROSSROAD];

    // Get all valid roads
    const validRoads = roads.filter((road) => !disallowedNames.includes(road.name));

    // Return a random one
    const rnd = NumberUtils.getRandomArrayIndex(validRoads.length);

    return validRoads[rnd];
  }

  public static getCloseVehicles(origin: THREE.Vector3, maxDistance: number, vehicles: Vehicle[]) {
    // Returns points within maxDistance from origin
    const within: Vehicle[] = [];

    vehicles.forEach((v) => {
      const distance = origin.distanceTo(v.position);

      if (origin.distanceTo(v.position) < maxDistance) {
        within.push(v);
      }
    });

    return within;
  }
}
