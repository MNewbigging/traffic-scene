import { RoadUtils } from './RoadUtils';
import { Vehicle } from '../model/Vehicle';

export class VehicleUtils {
  public static readonly raycastLength = 1.2;

  public static checkCollisions(allVehicles: Vehicle[]) {
    allVehicles.forEach((v) => (v.ignoreCollisions = false));

    for (const vehicle of allVehicles) {
      // Can we ignore collisions in already-tested vehicles this pass?
      if (vehicle.ignoreCollisions) {
        continue;
      }

      // Firstly, reset target speed
      vehicle.targetSpeed = vehicle.maxSpeed;

      // Get other nearby vehicles
      const nearbyVehicles = RoadUtils.getCloseVehicles(
        vehicle.position,
        vehicle.raycaster.far,
        allVehicles
      ).filter((v) => v.id !== vehicle.id);

      // If there are none, move on to next vehicle check
      if (!nearbyVehicles.length) {
        continue;
      }

      // Find first intersection with nearby vehicles
      for (const nearby of nearbyVehicles) {
        const intersect = vehicle.raycaster.intersectObject(nearby.bounds);
        // If no intersect, check next nearby vehicle
        if (!intersect.length) {
          continue;
        }

        // Intersected - does the nearby vehicle also intersect with this one?
        const reverseIntersect = nearby.raycaster.intersectObject(vehicle.bounds);
        if (reverseIntersect.length) {
          // Don't care about reverse intersections in different lanes
          const sameLane = vehicle.currentLane.id === nearby.currentLane.id;
          if (!sameLane) {
            // No need to check for collisions in nearby this pass
            nearby.ignoreCollisions = true;
            // No need for either car to slow down; break inner loop
            break;
          } else {
            // These vehicles are inside each other in the same lane - separate
            // One vehicle slows, the other ignores collisions
            nearby.ignoreCollisions = true;
            nearby.targetSpeed = 0.2;
          }
        }

        // Slow down this vehicle
        const distance = intersect[0].distance - vehicle.halfLength;
        const relativeDistance = distance / this.raycastLength;

        const t1 = vehicle.maxSpeed * relativeDistance;
        const t2 = nearby.actualSpeed * relativeDistance;

        vehicle.targetSpeed = vehicle.maxSpeed < nearby.maxSpeed ? t1 : t2;

        // Stop checking for intersections with other nearby vehicles
        break;
      }
    }
  }
}
