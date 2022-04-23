import * as THREE from 'three';

export class NumberUtils {
  public static createId(length: number = 4) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV0123456789';

    let id = '';
    for (let i = 0; i < length; i++) {
      const rnd = Math.floor(Math.random() * characters.length);
      id += characters.charAt(rnd);
    }

    return id;
  }

  // Returns if vectors are equal within a certain small allowance
  public static vectorsEqual(v1: THREE.Vector3, v2: THREE.Vector3) {
    const epsilon = 0.1;

    const xEquals = Math.abs(v1.x - v2.x) <= epsilon;
    const yEquals = Math.abs(v1.y - v2.y) <= epsilon;
    const zEquals = Math.abs(v1.z - v2.z) <= epsilon;

    return xEquals && yEquals && zEquals;
  }

  public static toVectorPrecision(vector: THREE.Vector3, digits: number) {
    const e = Math.pow(10, digits || 0);

    vector.x = Math.round(vector.x * e) / e;
    vector.y = Math.round(vector.y * e) / e;
    vector.z = Math.round(vector.z * e) / e;

    return vector;
  }

  public static toNumberPrecision(number: number, digits: number) {
    const e = Math.pow(10, digits);

    const n = Math.round(number * e) / e;

    return n;
  }

  public static getRandomArrayIndex(arrayLength: number) {
    return Math.floor(Math.random() * arrayLength);
  }

  public static getClosestDistanceFrom(point: THREE.Vector3, array: THREE.Vector3[]) {
    const i = this.getClosestIndexFromArray(point, array);

    return array[i];
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
