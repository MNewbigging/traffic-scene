import * as THREE from 'three';

import { RoadName } from '../utils/ModelLoader';

export class Road {
  public node: THREE.Points;
  private bounds: THREE.Box3;
  private size = new THREE.Vector3();

  constructor(public name: RoadName, public model: THREE.Group) {
    this.bounds = new THREE.Box3().setFromObject(model);
    this.bounds.getSize(this.size);

    this.generateNodePoint();

    const forward = new THREE.Vector3();
    model.getWorldDirection(forward);
    console.log('model forward', forward);
  }

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public setPositionX(x: number) {
    this.model.position.x = x;
    this.node.position.x = x;
  }

  public get width() {
    return this.bounds.max.x - this.bounds.min.x;
  }

  public get depth() {
    return this.bounds.max.z - this.bounds.min.z;
  }

  private generateNodePoint() {
    const dotGeom = new THREE.BufferGeometry();
    dotGeom.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([
          this.model.position.x,
          this.model.position.y + 0.2,
          this.model.position.z,
        ]),
        3
      )
    );
    const dotMat = new THREE.PointsMaterial({ size: 0.1, color: 'blue' });
    const dot = new THREE.Points(dotGeom, dotMat);

    this.node = dot;
  }
}
