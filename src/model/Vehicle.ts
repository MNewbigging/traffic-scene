import * as THREE from 'three';

import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  constructor(public name: VehicleName, public model: THREE.Group) {
    const forward = new THREE.Vector3();
    model.getWorldDirection(forward);
    console.log('model forward', forward);
  }
}
