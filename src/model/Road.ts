import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { RoadName } from '../utils/ModelLoader';

export interface RoadWaypoint {
  roadId: string;
  point: THREE.Vector3;
}

export class Road {
  public id = NumberUtils.createId();
  public neighbours: Road[] = [];
  public speedLimit = 1;
  public _waypoints: THREE.Vector3[] = [];
  private bounds: THREE.Box3;
  private size = new THREE.Vector3();

  constructor(public name: RoadName, public model: THREE.Group) {
    this.bounds = new THREE.Box3().setFromObject(model);
    this.bounds.getSize(this.size);

    const forward = new THREE.Vector3();
    model.getWorldDirection(forward);
    console.log('model forward for ' + name, forward);
  }

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get rotation(): THREE.Euler {
    return this.model.rotation;
  }

  public get width() {
    return this.bounds.max.x - this.bounds.min.x;
  }

  public get depth() {
    return this.bounds.max.z - this.bounds.min.z;
  }

  // Must be called after re-positioning this road
  public updateWaypoints() {
    this.setWaypoints();
  }

  public get waypoints(): RoadWaypoint[] {
    // TODO - each road may have different waypoints
    // Straight/end roads don't for now
    return this._waypoints.map((point) => ({
      roadId: this.id,
      point,
    }));
  }

  private setWaypoints() {
    switch (this.name) {
      case RoadName.STRAIGHT:
      case RoadName.END:
        this._waypoints = [this.position];
        break;
      case RoadName.BEND:
        const pos = this.position.clone();

        const first = new THREE.Vector3(pos.x - 0.75, pos.y, pos.z);
        const second = new THREE.Vector3(pos.x - 0.5, pos.y, pos.z + 0.068);
        const third = new THREE.Vector3(pos.x - 0.24, pos.y, pos.z + 0.24);
        const fourth = new THREE.Vector3(pos.x - 0.068, pos.y, pos.z + 0.5);
        const fifth = new THREE.Vector3(pos.x, pos.y, pos.z + 0.75);

        this._waypoints = [first, second, third, fourth, fifth];
        break;
    }
  }
}
