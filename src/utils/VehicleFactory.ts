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
      case VehicleName.DELIVERY:
        speed = 1.6;
        break;
      case VehicleName.GARBAGE:
        speed = 1.4;
        break;
      case VehicleName.HATCHBACK:
        speed = 1.8;
        break;
      case VehicleName.POLICE:
        speed = 2.2;
        break;
      case VehicleName.SEDAN:
        speed = 1.7;
        break;
      case VehicleName.SEDAN_SPORTS:
        speed = 2.2;
        break;
      case VehicleName.SUV:
        speed = 1.7;
        break;
      case VehicleName.TAXI:
        speed = 1.8;
        break;
      case VehicleName.TRUCK:
        speed = 1.6;
        break;
      case VehicleName.VAN:
        speed = 1.6;
        break;
    }

    vehicle.setSpeed(speed);

    return vehicle;
  }
}
