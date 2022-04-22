import * as THREE from 'three';
import { BufferGeometry } from 'three';

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

  public static toPrecision(vector: THREE.Vector3, digits: number) {
    const e = Math.pow(10, digits || 0);

    vector.x = Math.round(vector.x * e) / e;
    vector.y = Math.round(vector.y * e) / e;
    vector.z = Math.round(vector.z * e) / e;

    return vector;
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

  public static getPositions(geom: BufferGeometry) {
    const points: THREE.Vector3[] = [];

    const positions = geom.getAttribute('position');
    const posCount = positions.count;
    for (let i = 0; i < posCount; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i);
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
}
