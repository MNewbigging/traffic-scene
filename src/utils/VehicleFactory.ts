import * as THREE from 'three';

import { Vehicle } from '../model/Vehicle';
import { VehicleName } from '../loaders/ModelLoader';

export class VehicleFactory {
  public static createVehicle(name: VehicleName, model: THREE.Group, color?: THREE.Color) {
    const vehicle = new Vehicle(name, model);

    if (color) {
      vehicle.setColor(color);
    }

    // Set the speed
    let speed = 0.5;
    switch (name) {
      case VehicleName.DELIVERY:
        speed = 0.8;
        break;
      case VehicleName.GARBAGE:
        speed = 0.75;
        break;
      case VehicleName.HATCHBACK:
        speed = 0.9;
        break;
      case VehicleName.POLICE:
        speed = 1.1;
        break;
      case VehicleName.SEDAN:
        speed = 1;
        break;
      case VehicleName.SEDAN_SPORTS:
        speed = 1.1;
        break;
      case VehicleName.SUV:
        speed = 0.9;
        break;
      case VehicleName.TAXI:
        speed = 0.85;
        break;
      case VehicleName.TRUCK:
        speed = 0.75;
        break;
      case VehicleName.VAN:
        speed = 0.8;
        break;
    }

    vehicle.setSpeed(speed);

    return vehicle;
  }
}
