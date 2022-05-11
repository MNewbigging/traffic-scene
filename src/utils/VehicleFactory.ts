import * as THREE from 'three';

import { Vehicle } from '../model/Vehicle';
import { VehicleName } from '../loaders/ModelLoader';
import { VehicleUtils } from './VehicleUtils';

export class VehicleFactory {
  public static createVehicle(name: VehicleName, model: THREE.Group, color?: THREE.Color) {
    const vehicle = new Vehicle(name, model);

    this.setupVehicle(vehicle);

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

  private static setupVehicle(vehicle: Vehicle) {
    // Dimensions
    const box = new THREE.Box3().setFromObject(vehicle.model);
    const dimensions = new THREE.Vector3().subVectors(box.max, box.min);

    // Set vehicle half length
    vehicle.halfLength = dimensions.z * 0.5;

    // Create the bounds mesh
    const boundsGeom = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);
    const boundsMatrix = new THREE.Matrix4().setPosition(
      dimensions.addVectors(box.min, box.max).multiplyScalar(0.5)
    );
    boundsGeom.applyMatrix4(boundsMatrix);
    const bounds = new THREE.Mesh(
      boundsGeom,
      new THREE.MeshBasicMaterial({ color: 'white', wireframe: true })
    );
    vehicle.bounds = bounds;

    // Setup vehicle raycaster
    vehicle.raycaster.near = 0;
    vehicle.raycaster.far = vehicle.halfLength + VehicleUtils.raycastLength;

    // Create the route line
    const routeLineMat = new THREE.LineBasicMaterial({ color: 'blue' });
    const routeLineGeom = new THREE.BufferGeometry();
    vehicle.routeLine = new THREE.Line(routeLineGeom, routeLineMat);
  }

  private static createCameraAnchorPoints(vehicle: Vehicle) {}
}
