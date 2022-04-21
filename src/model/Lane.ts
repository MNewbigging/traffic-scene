import * as THREE from 'three';

import { RoadUtils } from '../utils/RoadUtils';

/**
 * A single lane of a road, which may have many lanes. Each lane has a line object,
 * initialy setup in the factory relative to road's default forward direction and
 * dimensions. When the road is transformed, this line can match it via copyTransforms.
 * The line is then used to get the waypoints along it.
 *
 * Each lane also contains a references fromRoad and toRoad which are indices into the
 * parent road's 'neighbours' array of roads. This is to easily return the lane for a
 * route given the road travelling from and to via the parent.
 */
export class Lane {
  public line: THREE.Line;
  public fromRoadIdx = 0;
  public toRoadIdx = 0;
  public waypoints: THREE.Vector3[] = [];

  public setup(roadModel: THREE.Object3D, edgePoints: THREE.Vector3[]) {
    // Move with the road
    RoadUtils.addTransforms(roadModel, this.line);

    // Update waypoints with new transform
    this.updateWaypoints();

    // Link lane from/to to correct edge points
    this.findFromAndTo(edgePoints);
  }

  // Crates waypoints from positions on the line
  private updateWaypoints() {
    // Clear waypoints
    this.waypoints = [];

    // Get points from line
    const positions = this.line.geometry.getAttribute('position');

    const posCount = positions.count;
    for (let i = 0; i < posCount; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i);
      const worldPoint = this.line.localToWorld(point);
      this.waypoints.push(worldPoint);
    }
  }

  // Will determine which edge points mark the from and to for this lane
  private findFromAndTo(edgePoints: THREE.Vector3[]) {
    if (!this.waypoints.length) {
      console.error('No waypoints to link to edge points');
      return;
    }

    // From is first item in waypoints
    const from = this.waypoints[0];
    this.fromRoadIdx = RoadUtils.getClosestIndexFromArray(from, edgePoints);

    // To is last item in waypoints
    const to = this.waypoints[this.waypoints.length - 1];
    this.toRoadIdx = RoadUtils.getClosestIndexFromArray(to, edgePoints);
  }
}
