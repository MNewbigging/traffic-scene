import * as THREE from 'three';

import { RoadName } from '../utils/ModelLoader';

export class Road {
  private bounds: THREE.Box3;
  private size = new THREE.Vector3();

  constructor(public name: RoadName, public model: THREE.Group) {
    this.bounds = new THREE.Box3().setFromObject(model);
    this.bounds.getSize(this.size);

    // const forward = new THREE.Vector3();
    // model.getWorldDirection(forward);
    // console.log('model forward', forward);
  }

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get width() {
    return this.bounds.max.x - this.bounds.min.x;
  }

  public get depth() {
    return this.bounds.max.z - this.bounds.min.z;
  }
}
