import * as THREE from 'three';

import { Vehicle } from '../model/Vehicle';
import { VehicleName } from './ModelLoader';

export class VehicleFactory {
  public static createVehicle(name: VehicleName, model: THREE.Group, color?: THREE.Color) {
    const vehicle = new Vehicle(name, model);

    if (color) {
      vehicle.setColor(color);
    }

    // Set the speed
    let speed = 1;
    switch (name) {
      case VehicleName.SEDAN:
        speed = 1.5;
        break;
      case VehicleName.HATCHBACK:
        speed = 1.8;
        break;
    }

    vehicle.setSpeed(speed);

    return vehicle;
  }
}
