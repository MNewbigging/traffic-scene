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
    const epsilon = 0.01;

    const xEquals = Math.abs(v1.x - v2.x) <= epsilon;
    const yEquals = Math.abs(v1.y - v2.y) <= epsilon;
    const zEquals = Math.abs(v1.z - v2.z) <= epsilon;

    return xEquals && yEquals && zEquals;
  }
}
